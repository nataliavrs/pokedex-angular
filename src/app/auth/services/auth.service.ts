// Generate random token upon login

import { Injectable } from '@angular/core';
import { PokeState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { selectLoggedInStatus } from '../store/auth.selectors';
import { Observable, of } from 'rxjs';
import { login } from '../store/auth.actions';

export class LoggingError {
  constructor(public message: string, public type: 'IN' | 'OUT') {
    this.message = message;
    this.type = type;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  tokenValidityPeriod = 10 * 60 * 1000; // 10 minutes
  tokenKey = 'accessToken';

  constructor(private store: Store<PokeState>) {}

  logInUser() {
    try {
      // throw new LoggingError('Limit in local storage', 'IN');
      const token = this.generateLoginToken();
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      throw error;
    }
  }

  logOutExpiredUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // throw new LoggingError('errore logout', 'OUT');
          localStorage.removeItem(this.tokenKey);
          this.store.dispatch(
            login({
              request: { isLoggedIn: false, user: null, isTokenExpired: true },
            })
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 3000 || this.tokenValidityPeriod);
    });
  }

  logOutUser() {
    try {
      // throw new LoggingError('errore logout', 'OUT');
      localStorage.removeItem(this.tokenKey);
      this.store.dispatch(
        login({
          request: { isLoggedIn: false, user: null, isTokenExpired: false },
        })
      );
    } catch (error) {
      throw error;
    }
  }

  generateLoginToken() {
    const randomString = Math.random().toString(36).substring(2);
    return `${randomString}${randomString}`;
  }

  getIsLoggedIn(): Observable<boolean> {
    return this.store.select(selectLoggedInStatus);
  }
}
