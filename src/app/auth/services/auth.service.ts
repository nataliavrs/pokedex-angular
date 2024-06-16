// Generate random token upon login

import { Injectable } from '@angular/core';
import { PokeState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { selectLoggedInStatus } from '../store/auth.selectors';
import { Observable, of } from 'rxjs';

// Service to set and get in localStorage the token of users's authentication -> might not need
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private store: Store<PokeState>) {}

  getIsLoggedIn(): Observable<boolean> {
    return this.store.select(selectLoggedInStatus);
  }
}
