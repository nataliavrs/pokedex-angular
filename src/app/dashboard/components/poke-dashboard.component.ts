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
  typesChart$!: Observable<any>;
  totalTypes$!: Observable<number>;
  options = {
    plugins: {
      datalabels: {
        color: '#36A2EB',
        // formatter: (value, context) => {
        //   return context.chart.data.labels[context.dataIndex];
        // },
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  constructor(
    private store: Store<PokeState>,
    private pokeHttpService: PokeHttpService,
    private toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.getPokemonTypesChart();
  }

  initBarChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.barData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Sales',
          data: [540, 325, 702, 620],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
        },
      ],
    };

    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  initLineChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.lineData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Dataset 1',
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          yAxisID: 'y',
          tension: 0.4,
          data: [65, 59, 80, 81, 56, 55, 10],
        },
        {
          label: 'Dataset 2',
          fill: false,
          borderColor: documentStyle.getPropertyValue('--green-500'),
          yAxisID: 'y1',
          tension: 0.4,
          data: [28, 48, 40, 19, 86, 27, 90],
        },
      ],
    };

    this.lineOptions = {
      stacked: false,
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            drawOnChartArea: false,
            color: surfaceBorder,
          },
        },
      },
    };
  }

  getGender() {
    this.pokeHttpService
      .get<PokemonData>('/gender', {}, true)
      .pipe(
        take(1),
        map((res) => {
          console.log(res);
          return res;
        }),
        catchError((error) => {
          console.log(error);
          this.toasterService.showErrorMessage('Error getting gender');
          return of(null);
        })
      )
      .subscribe();
  }

  getPokemons() {
    this.pokeHttpService
      .get<PokemonData>('/pokemon', {}, true)
      .pipe(
        take(1),
        map((res) => {
          console.log(res);
          return res;
        }),
        catchError((error) => {
          console.log(error);
          this.toasterService.showErrorMessage('Error getting gender');
          return of(null);
        })
      )
      .subscribe();
  }

  getPokemonTypesChart() {
    this.typesChart$ = this.pokeHttpService
      .get<BaseApiResponse>(`${EndPoints.baseUrl}/type`, {}, true)
      .pipe(
        take(1),
        map((res) => {
          console.log(res);
          return res;
        }),
        switchMap((res) => {
          const totalTypes = res.results.length;
          const responses = res.results.map(({ url }) => {
            return this.pokeHttpService
              .get<PokemonTypeDetails>(url, {}, true)
              .pipe(
                take(1),
                map((res) => {
                  console.log(res);
                  return {
                    pokemons: res.pokemon,
                    name: res.name,
                  };
                })
              );
          });
          return forkJoin(responses);
        }),
        map((res) => {
          const sortRes = res
            .filter(({ name, pokemons }) => pokemons.length)
            .sort((a, b) => b.pokemons.length - a.pokemons.length);
          const data = sortRes.map((data) => data.pokemons.length);
          const labels = sortRes.map((data) =>
            this.upperCaseFirstLetter(data.name)
          );

          this.totalTypes$ = of(res.length);
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
          this.toasterService.showErrorMessage('Error getting gender');
          return of(null);
        })
      );
  }
  upperCaseFirstLetter(name: string): string {
    return name.slice(0, 1).toLocaleUpperCase() + name.slice(1).toLowerCase();
  }

  // Generations -> bar chart
  // Genders -> pie chart
  // Gender by generations -> Vertical Bar
  // catch rate capture_rate:190 -> Higher catch rates mean that the Pokémon is easier to catch, up to a maximum of 255.
  // /pokemon-species/1 base_happiness:50
  // capture_rate:45

  private generateColors(count: number): {
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
}

enum TYPES {
  NORMAL = '1',
  FIGHTING = '2',
  FLYING = '3',
  POISON = '4',
  GROUND = '5',
  ROCK = '6',
  BUG = '7',
  GHOST = '8',
  STEEL = '9',
  FIRE = '10',
  WATER = '11',
  GRASS = '12',
  ELECTRIC = '13',
  PSYCHIC = '14',
  ICE = '15',
  DRAGON = '16',
  DARK = '17',
  FAIRY = '18',
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
