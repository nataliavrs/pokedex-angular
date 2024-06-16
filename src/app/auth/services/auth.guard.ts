import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PokeState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { selectLoggedInStatus } from '../store/auth.selectors';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private router: Router,
    private store: Store<PokeState>,
    private authService: AuthService
  ) {}

  canActivate() {
    return this.authService.getIsLoggedIn().pipe(
      take(1),
      map((isLoggedIn) => {
        console.log('can activate', isLoggedIn);
        if (isLoggedIn) {
          return true;
        } else {
          this.router.navigate([]);
          return false;
        }
      })
    );
  }
}
