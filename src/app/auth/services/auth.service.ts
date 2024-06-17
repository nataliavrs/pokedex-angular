import { Injectable } from '@angular/core';
import { PokeState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { login } from '../store/auth.actions';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  tokenValidityPeriod = 10 * 60 * 1000; // 10 minutes
  tokenKey = 'accessToken';
  turnOffLogOutTimer: boolean = false;

  constructor(private store: Store<PokeState>, private router: Router) {}

  /**
   * Logs in the user by generating a login token and storing it in the local storage.
   * @return {void} This function does not return anything.
   * @throws {Error} If there is an error during the login process.
   */
  logInUser(): void {
    try {
      // throw new Error('Log in user error');
      const token = this.generateLoginToken();
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logs out the user by removing the access token from local storage and dispatching a login action with updated state.
   * @return {void} This function does not return anything.
   * @throws {Error} If there is an error during the logout process.
   */
  logOutUser(): void {
    try {
      // throw new Error('Log out user error');
      localStorage.removeItem(this.tokenKey);
      this.store.dispatch(
        login({
          request: { isLoggedIn: false, user: null, isTokenExpired: false },
        })
      );
      this.turnOffLogOutTimer = true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logs out the user by removing the access token from local storage and dispatching a login action with updated state.
   * @return {Promise<void>} A promise that resolves when the user is logged out successfully, or rejects with an error if there is an issue.
   */
  logOutExpiredUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // throw new Error('Log out expired token user error');
          localStorage.removeItem(this.tokenKey);
          this.store.dispatch(
            login({
              request: { isLoggedIn: false, user: null, isTokenExpired: true },
            })
          );
          this.router.navigateByUrl('');
          resolve();
        } catch (error) {
          reject(error);
        }
      }, this.tokenValidityPeriod);
    });
  }

  /**
   * Generates a login token by creating a random string and concatenating it with itself.
   * @return {string} The generated login token.
   */
  generateLoginToken(): string {
    const randomString = Math.random().toString(36).substring(2);
    return `${randomString}${randomString}`;
  }
}
