import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PokeState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { selectLoggedInStatus } from '../store/auth.selectors';
import { take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private store: Store<PokeState>) {}

  canActivate() {
    return this.store.select(selectLoggedInStatus).pipe(
      take(1),
      tap((isLoggedIn) => {
        console.log('Can activate route?', isLoggedIn);
        return isLoggedIn;
      })
    );
  }
}
