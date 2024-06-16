import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { PokeState } from './store/app.state';
import { Store } from '@ngrx/store';
import { selectLoggedInStatus } from './auth/store/auth.selectors';
import { AuthService } from './auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, from, map, of } from 'rxjs';
import { login } from './auth/store/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'pokedex-angular';
}
