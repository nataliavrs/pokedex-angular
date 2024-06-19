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
import { ChartData } from 'chart.js';
import { Generation, Gender, DataSet, GenderType } from '../types/charts.type';

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
    // Retrieve types
    this.pokemonTypesData$ = this.pokeHttpService
      .get<BaseApiResponse>(`${EndPoints.baseUrl}/type`, {}, true)
      .pipe(
        take(1),
        // Retrieve types details
        switchMap((types) => {
          const responses = types.results.map(({ url }) => {
            return this.pokeHttpService
              .get<PokemonTypeDetails>(url, {}, true)
              .pipe(
                take(1),
                map((typeDetail) => {
                  return {
                    name: typeDetail.name,
                    pokemons: typeDetail.pokemon,
                  };
                })
              );
          });
          return forkJoin(responses);
        }),
        catchError((error) => {
          console.log(error);
          this.toasterService.showErrorMessage(
            'Error retrieving pokémons types'
          );
          return of(null);
        }),
        // Sort types
        map((typesDetails) => {
          const sortedTypes = (typesDetails || [])
            .filter(({ pokemons }) => pokemons.length)
            .sort((a, b) => b.pokemons.length - a.pokemons.length);
          const data = sortedTypes.map((data) => data.pokemons.length);
          const labels = sortedTypes.map((data) =>
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
            'Error retrieving pokémons types'
          );
          return of(null);
        })
      );
  }

  getPokemonGenerationsData(): void {
    this.pokemonGenerationsData$ = this.pokeHttpService
      // Retrieve generations
      .get<BaseApiResponse>(`${EndPoints.baseUrl}/generation`, {}, true)
      .pipe(
        take(1),
        // Retrieve generations details
        switchMap((generations) => {
          const generationsDetails = generations.results.map(({ url }) => {
            return this.pokeHttpService.get<Generation>(url, {}, true).pipe(
              take(1),
              map((generationsDetails) => {
                return {
                  name: generationsDetails.name,
                  pokemons: generationsDetails.pokemon_species,
                };
              })
            );
          });
          return forkJoin(generationsDetails);
        }),
        catchError((error) => {
          console.log(error);
          this.toasterService.showErrorMessage(
            'Error retrieving pokémons generations'
          );
          return of(null);
        }),
        // Sort generations
        map((generationsDetails) => {
          const sortRes = (generationsDetails || [])
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
          const message = 'Error fetching generation responses:';
          console.error(message, error);
          this.toasterService.showErrorMessage(message);
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
        // Retrieve gender details
        switchMap((genders) => {
          console.log('Genders:', genders?.results);

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
        // Map gender details into female, male and genderless
        map((genderDetails) => {
          console.log('Gender Details:', genderDetails);

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
            .filter((name) => !!name);
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
        // Retrieve generations and generations details
        switchMap((gendersAndPokemons) => {
          console.log('Genders and Pokemons:', gendersAndPokemons);

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
                // Fetch generation details
                switchMap((res) => {
                  if (!res) {
                    return of(null);
                  }
                  const generations = res.results.map(({ url }) =>
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
                  // Map and merge gender and generation details
                  return forkJoin(generations).pipe(
                    map((generationDetails) => ({
                      genders: gendersAndPokemons.genders,
                      generations: generationDetails
                        .filter((detail) => detail)
                        .map((detail) => detail?.generation),
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
                      generationPokemonNames: generationDetails.map(
                        (detail) => ({
                          generation: detail?.generation,
                          pokemonNames: detail?.pokemonSpecies.map(
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
        // Calculate gender per generation
        map((gendersPokemonGeneration) => {
          console.log('Genders Pokemon Generation:', gendersPokemonGeneration);

          if (!gendersPokemonGeneration) {
            return null;
          }

          const genderPokemonsPerGeneration =
            gendersPokemonGeneration.generationPokemonNames.map((gen) => ({
              generation: gen?.generation,
              genderless: (gen?.pokemonNames || []).filter((name) =>
                gendersPokemonGeneration.genderPokemonNames.genderlessPokemonsNames.includes(
                  name
                )
              ),
              female: (gen?.pokemonNames || []).filter((name) =>
                gendersPokemonGeneration.genderPokemonNames.femalePokemonsNames.includes(
                  name
                )
              ),
              male: (gen?.pokemonNames || []).filter((name) =>
                gendersPokemonGeneration.genderPokemonNames.malePokemonsNames.includes(
                  name
                )
              ),
            }));

          return {
            genders: gendersPokemonGeneration.genders,
            generations: gendersPokemonGeneration.generations,
            genderPerGenerations: genderPokemonsPerGeneration,
          };
        }),
        // Generate chart data
        map((chartData) => {
          console.log('Chartdata', chartData);
          if (!chartData || !chartData.genders || !chartData.generations) {
            return null;
          }

          const backgroundColor = {
            female: 'hsla(330, 100%, 70%, 1)',
            male: 'hsla(240, 100%, 50%, 1)',
            genderless: 'hsla(0, 0%, 50%, 1)',
          };
          const dataSetsPerGenders: DataSet[] = chartData.genders?.map(
            (gender) => ({
              label: this.upperCaseFirstLetter(gender || '') || '',
              data: chartData.genderPerGenerations?.map(
                (generation) => generation[gender as GenderType]?.length || 0
              ),
              backgroundColor: [backgroundColor[gender as GenderType]],
            })
          );
          const generationNames: string[] = chartData.generations.filter(
            (gen): gen is string => typeof gen === 'string'
          );

          return {
            labels: generationNames.map((gen) =>
              this.formatGenerationString(gen)
            ),
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
