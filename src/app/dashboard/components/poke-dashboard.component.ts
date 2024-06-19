import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PokeState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { selectUser } from '../../auth/store/auth.selectors';
import { CommonModule } from '@angular/common';
import {
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { User } from '../../auth/types/user.interface';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import {
  BaseApiResponse,
  EndPoints,
  PokeHttpService,
  PokemonTypeDetails,
} from '../../shared/services/poke-http.service';
import { ToasterService } from '../../shared/services/toaster.service';

@Component({
  selector: 'poke-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule],
  templateUrl: './poke-dashboard.component.html',
  styleUrl: './poke-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokeDashboardComponent {
  user$: Observable<User | null> = this.store.select(selectUser);

  lineData: any;
  lineOptions: any;
  barData: any;
  basicOptions: any;
  pokemonTypesData$!: Observable<ChartData | null>;
  pokemonGenerationsData$!: Observable<ChartData | null>;
  pokemonGenderByGenerationsData$!: Observable<ChartData | null>;

  constructor(
    private store: Store<PokeState>,
    private pokeHttpService: PokeHttpService,
    private toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.getPokemonTypesData();
    this.getPokemonGenerationsData();
    this.getPokemonGendersByGenerationData();
  }

  getPokemonTypesData(): void {
    this.pokemonTypesData$ = this.pokeHttpService
      .get<BaseApiResponse>(`${EndPoints.baseUrl}/type`, {}, true)
      .pipe(
        take(1),
        switchMap((res) => {
          const responses = res.results.map(({ url }) => {
            return this.pokeHttpService
              .get<PokemonTypeDetails>(url, {}, true)
              .pipe(
                take(1),
                map((res) => {
                  return {
                    name: res.name,
                    pokemons: res.pokemon,
                  };
                })
              );
          });
          return forkJoin(responses);
        }),
        map((res) => {
          const sortRes = res
            .filter(({ pokemons }) => pokemons.length)
            .sort((a, b) => b.pokemons.length - a.pokemons.length);
          const data = sortRes.map((data) => data.pokemons.length);
          const labels = sortRes.map((data) =>
            this.upperCaseFirstLetter(data.name)
          );
          const colors = this.generateColors(data.length);

          return {
            labels,
            datasets: [
              {
                label: 'Pokémons of this type',
                data,
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderWidth: 2,
              },
            ],
          };
        }),
        catchError((error) => {
          console.log(error);
          this.toasterService.showErrorMessage(
            'Error retrieving pokémon types'
          );
          return of(null);
        })
      );
  }

  getPokemonGendersByGenerationData(): void {
    this.pokemonGenderByGenerationsData$ = this.pokeHttpService
      // Retrieve genders
      .get<BaseApiResponse>(`${EndPoints.baseUrl}/gender`, {}, true)
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Error retrieving genders:', error);
          this.toasterService.showErrorMessage('Error retrieving genders');
          return of(null);
        }),
        switchMap((genders) => {
          if (!genders) {
            return of(null);
          }
          return forkJoin(
            genders.results.map(({ url }) =>
              this.pokeHttpService.get<Gender>(url, {}, true).pipe(
                take(1),
                map((res) => ({
                  genderName: res.name,
                  pokemonSpecies: res.pokemon_species_details,
                })),
                catchError((error) => {
                  console.error(`Error retrieving gender from ${url}:`, error);
                  this.toasterService.showErrorMessage(
                    'Error retrieving gender details'
                  );
                  return of(null);
                })
              )
            )
          );
        }),
        map((genderDetails) => {
          if (!genderDetails) {
            return {
              genders: [],
              femalePokemons: null,
              malePokemons: null,
              genderLessPokemons: null,
            };
          }
          const gendersName = genderDetails
            .map((genderDetail) => genderDetail?.genderName)
            .filter((name) => !!name); // Filter out undefined names
          const femalePokemons = genderDetails.find(
            (genderDetail) => genderDetail?.genderName === 'female'
          );
          const malePokemons = genderDetails.find(
            (genderDetail) => genderDetail?.genderName === 'male'
          );
          const genderLessPokemons = genderDetails.find(
            (genderDetail) => genderDetail?.genderName === 'genderless'
          );
          return {
            genders: gendersName,
            femalePokemons,
            malePokemons,
            genderLessPokemons,
          };
        }),
        switchMap((gendersAndPokemons) => {
          if (!gendersAndPokemons) {
            return of(null);
          }
          return (
            this.pokeHttpService
              // Fetch generations
              .get<BaseApiResponse>(`${EndPoints.baseUrl}/generation`, {}, true)
              .pipe(
                take(1),
                catchError((error) => {
                  console.error('Error fetching generations:', error);
                  this.toasterService.showErrorMessage(
                    'Error fetching generations'
                  );
                  return of(null);
                }),
                switchMap((res) => {
                  if (!res) {
                    return of(null);
                  }
                  const responses = res.results.map(({ url }) =>
                    this.pokeHttpService.get<Generation>(url, {}, true).pipe(
                      take(1),
                      map((generationRes) => ({
                        generation: generationRes.name,
                        pokemonSpecies: generationRes.pokemon_species,
                      })),
                      catchError((error) => {
                        console.error(
                          `Error retrieving generation from ${url}:`,
                          error
                        );
                        this.toasterService.showErrorMessage(
                          'Error retrieving generation details'
                        );
                        return of(null);
                      })
                    )
                  );
                  return forkJoin(responses).pipe(
                    map((generationResponses) => ({
                      genders: gendersAndPokemons.genders,
                      generations: generationResponses
                        .filter((res) => res)
                        .map((res) => res?.generation),
                      genderPokemonNames: {
                        femalePokemonsNames:
                          gendersAndPokemons.femalePokemons?.pokemonSpecies.map(
                            (pokemon) => pokemon.pokemon_species.name
                          ) || [],
                        malePokemonsNames:
                          gendersAndPokemons.malePokemons?.pokemonSpecies.map(
                            (pokemon) => pokemon.pokemon_species.name
                          ) || [],
                        genderlessPokemonsNames:
                          gendersAndPokemons.genderLessPokemons?.pokemonSpecies.map(
                            (pokemon) => pokemon.pokemon_species.name
                          ) || [],
                      },
                      generationPokemonNames: generationResponses.map(
                        (res) => ({
                          generation: res?.generation,
                          pokemonNames: res?.pokemonSpecies.map(
                            (pokemon) => pokemon.name
                          ),
                        })
                      ),
                    })),
                    catchError((error) => {
                      const message = 'Error fetching generation responses:';
                      console.error(message, error);
                      this.toasterService.showErrorMessage(message);
                      return of(null);
                    })
                  );
                })
              )
          );
        }),
        map((res) => {
          if (!res) {
            return null;
          }
          const genderPokemonsPerGeneration = res.generationPokemonNames.map(
            (gen) => ({
              generation: gen?.generation,
              genderless: (gen?.pokemonNames || []).filter((name) =>
                res.genderPokemonNames.genderlessPokemonsNames.includes(name)
              ),
              female: (gen?.pokemonNames || []).filter((name) =>
                res.genderPokemonNames.femalePokemonsNames.includes(name)
              ),
              male: (gen?.pokemonNames || []).filter((name) =>
                res.genderPokemonNames.malePokemonsNames.includes(name)
              ),
            })
          );
          return {
            genders: res.genders,
            generations: res.generations,
            genderPerGenerations: genderPokemonsPerGeneration,
          };
        }),
        map((chartData) => {
          if (!chartData || !chartData.genders || !chartData.generations) {
            return null;
          }
          console.log('chartdata 🤠🤠🤠', chartData);

          const backgroundColor = {
            female: 'hsla(330, 100%, 70%, 1)',
            male: 'hsla(240, 100%, 50%, 1)',
            genderless: 'hsla(0, 0%, 50%, 1)',
          };
          const dataSetsPerGenders: DataSet[] = chartData.genders?.map(
            (gender) => ({
              label: gender || '',
              data: chartData.genderPerGenerations?.map(
                (generation) => generation[gender as GenderType]?.length || 0
              ),
              backgroundColor: [backgroundColor[gender as GenderType]],
            })
          );
          const labels: string[] = chartData.generations.filter(
            (gen): gen is string => typeof gen === 'string'
          );
          return {
            labels,
            datasets: dataSetsPerGenders,
          };
        }),
        catchError((error) => {
          console.error(
            'Error retrieving pokémon genders per generation',
            error
          );
          this.toasterService.showErrorMessage(
            'Error retrieving pokémon genders per generation'
          );
          return of(null);
        })
      );
  }

  getPokemonGenerationsData(): void {
    this.pokemonGenerationsData$ = this.pokeHttpService
      .get<BaseApiResponse>(`${EndPoints.baseUrl}/generation`, {}, true)
      .pipe(
        take(1),
        switchMap((res) => {
          const responses = res.results.map(({ url }) => {
            return this.pokeHttpService.get<Generation>(url, {}, true).pipe(
              take(1),
              map((res) => {
                return {
                  name: res.name,
                  pokemons: res.pokemon_species,
                };
              })
            );
          });
          return forkJoin(responses);
        }),
        map((res) => {
          const sortRes = res
            .filter(({ pokemons }) => pokemons.length)
            .sort((a, b) => a.pokemons.length - b.pokemons.length);
          const data = sortRes.map((data) => data.pokemons.length);
          const labels = sortRes.map((data) =>
            this.formatGenerationString(data.name)
          );
          const colors = this.generateColors(data.length);

          return {
            labels,
            datasets: [
              {
                label: 'Pokémons of this generation',
                data,
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderWidth: 2,
              },
            ],
          };
        }),
        catchError((error) => {
          console.error('Error retrieving pokémon generations', error);
          this.toasterService.showErrorMessage(
            'Error retrieving pokémon generations'
          );
          return of(null);
        })
      );
  }

  // Genders -> pie chart
  // Gender by generations -> Vertical Bar
  // catch rate capture_rate:190 -> Higher catch rates mean that the Pokémon is easier to catch, up to a maximum of 255.
  // /pokemon-species/1 base_happiness:50
  // capture_rate:45

  formatGenerationString(input: string): string {
    const parts = input.split('-');
    const firstPart =
      parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const secondPart = parts[1].toUpperCase();
    return `${firstPart}-${secondPart}`;
  }

  generateColors(count: number): {
    backgroundColor: string[];
    borderColor: string[];
  } {
    const backgroundColor: string[] = [];
    const borderColor: string[] = [];

    for (let i = 0; i < count; i++) {
      const hue = ((i * 360) / count) % 360;
      backgroundColor.push(`hsla(${hue}, 70%, 50%, 0.5)`);
      borderColor.push(`hsl(${hue}, 50%, 50%)`);
    }

    return { backgroundColor, borderColor };
  }

  upperCaseFirstLetter(name: string): string {
    return name.slice(0, 1).toLocaleUpperCase() + name.slice(1).toLowerCase();
  }
}

interface PokemonSpecies {
  name: string;
  url: string;
}

interface PokemonSpeciesDetails {
  rate: number;
  pokemon_species: PokemonSpecies;
}

interface RequiredForEvolution {
  name: string;
  url: string;
}

interface PokemonData {
  id: number;
  name: string;
  pokemon_species_details: PokemonSpeciesDetails[];
  required_for_evolution: RequiredForEvolution[];
}

interface ChartData {
  labels: string[];
  datasets: DataSet[];
}

interface DataSet {
  label: string | undefined;
  data: number[];
  backgroundColor: string[];
  borderColor?: string[];
  borderWidth?: number;
}

// Generations
interface Language {
  name: string;
  url: string;
}

interface NamedAPIResource {
  name: string;
  url: string;
}

interface Generation {
  abilities: any[];
  id: number;
  main_region: NamedAPIResource;
  moves: NamedAPIResource[];
  name: string;
  names: {
    language: NamedAPIResource;
    name: string;
  }[];
  pokemon_species: NamedAPIResource[];
}

// Genders by generation
interface PokemonSpeciesDetails {
  pokemon_species: {
    name: string;
    url: string;
  };
  rate: number;
}

interface Gender {
  id: number;
  name: string;
  pokemon_species_details: PokemonSpeciesDetails[];
}

type GenderType = 'genderless' | 'female' | 'male';

interface Specie {
  generation: {
    name: string;
    url: string;
  };
  base_happiness: number;
  capture_rate: number;
  color: {
    name: string;
    url: string;
  };
  egg_groups: {
    name: string;
    url: string;
  }[];
  evolution_chain: {
    url: string;
  };
  evolves_from_species: null | {
    name: string;
    url: string;
  };
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version: {
      name: string;
      url: string;
    };
  }[];
}
