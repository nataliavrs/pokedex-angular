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
export class HttpService {
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  private cache: { [key: string]: any } = {};

  constructor(private httpClient: HttpClient) {}

  get<T>(
    url: string,
    options: Options,
    useCache: boolean = true
  ): Observable<T> {
    const headers = options?.headers
      ? new HttpHeaders({ ...this.defaultHeaders, ...options.headers })
      : this.defaultHeaders;
    const mergedOptions = { ...options, headers };
    const fullUrl = `${EndPoints.baseUrl}${url}`;

    if (useCache && this.cache[fullUrl]) {
      const cachedData = this.getFromCache(fullUrl);
      return of((cachedData as T) || this.cache[fullUrl]);
    }

    return this.httpClient.get<T>(fullUrl, mergedOptions).pipe(
      take(1),
      tap((res) => {
        if (useCache) {
          localStorage.setItem(fullUrl, JSON.stringify(res));
          this.cache[fullUrl] = res;
        }
      }),
      catchError((error) => {
        console.error(`HTTP GET ERROR: ${url}, error: ${error}`);
        throw error;
      })
    ) as Observable<T>;
  }

  getFromCache(fullUrl: string) {
    const cachedData = localStorage.getItem(fullUrl) || '{}';
    return JSON.parse(cachedData);
  }
}

export enum EndPoints {
  baseUrl = 'https://pokeapi.co/api/v2/',
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
