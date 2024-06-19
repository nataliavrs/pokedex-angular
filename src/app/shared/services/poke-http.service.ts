import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokeHttpService {
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  private cache: { [key: string]: any } = {};

  constructor(private httpClient: HttpClient) {}

  get<T>(
    url: string,
    options?: Options,
    useCache: boolean = true
  ): Observable<T> {
    const headers = options?.headers
      ? new HttpHeaders({ ...this.defaultHeaders, ...options.headers })
      : this.defaultHeaders;
    const mergedOptions = { ...options, headers };

    if (useCache && this.cache[url]) {
      const cachedData = this.getFromCache(url);
      return of((cachedData as T) || this.cache[url]);
    }

    return this.httpClient.get<T>(url, mergedOptions).pipe(
      take(1),
      tap((res) => {
        if (useCache) {
          localStorage.setItem(url, JSON.stringify(res));
          this.cache[url] = res;
        }
      }),
      catchError((error) => {
        console.error(
          `GET error calling: ${url}, Status: ${error.status}, Message ${error.message}`
        );
        throw error;
      })
    ) as Observable<T>;
  }

  getFromCache(url: string) {
    const cachedData = localStorage.getItem(url) || '{}';
    return JSON.parse(cachedData);
  }
}

export enum EndPoints {
  baseUrl = 'https://pokeapi.co/api/v2',
}

export interface Options {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: 'body';
  context?: HttpContext;
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}

export interface BaseApiResponse {
  count: number;
  next: string;
  previous: null;
  results: {
    name: string;
    url: string;
  }[];
}

// Get types interface
interface PokemonType {
  name: string;
  url: string;
}

interface Generation {
  name: string;
  url: string;
}

interface GameIndex {
  game_index: number;
  generation: Generation;
}

interface Move {
  name: string;
  url: string;
}

interface Language {
  name: string;
  url: string;
}

interface TypeName {
  language: Language;
  name: string;
}

interface PokemonSlot {
  pokemon: PokemonType;
  slot: number;
}

export interface PokemonTypeDetails {
  damage_relations: {
    double_damage_from: PokemonType[];
    double_damage_to: PokemonType[];
    half_damage_from: PokemonType[];
    half_damage_to: PokemonType[];
    no_damage_from: PokemonType[];
    no_damage_to: PokemonType[];
  };
  game_indices: GameIndex[];
  generation: Generation;
  id: number;
  move_damage_class: {
    name: string;
    url: string;
  };
  moves: Move[];
  name: string;
  names: TypeName[];
  past_damage_relations: any[];
  pokemon: PokemonSlot[];
}
