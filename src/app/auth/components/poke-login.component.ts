import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { PokeState } from '../../store/app.state';
import { login } from '../store/auth.actions';
import {
  selectIsTokenExpired,
  selectLoggedInStatus,
  selectUser,
} from '../store/auth.selectors';
import { Router } from '@angular/router';
import { AuthService, LoggingError } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';

@Component({
  selector: 'poke-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './poke-login.component.html',
  styleUrl: './poke-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokeLoginComponent {
  loginForm: FormGroup = this.formBuilder.group({
    // TODO MOCK DATA
    // email: ['', [Validators.required, Validators.email]],
    // password: ['', Validators.required],
    email: ['nubi@email.it', [Validators.required, Validators.email]],
    password: ['123', Validators.required],
  });
  hidePassword: boolean = true;
  isUserLoggedIn$ = this.store.select(selectLoggedInStatus);
  timerRunning: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<PokeState>,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.store.select(selectIsTokenExpired).subscribe((isExpired) => {
      if (this.timerRunning && isExpired) {
        this.timerRunning = false;
        this.snackBar.open('token expired', 'Close', { duration: 2000 });
        this.loginForm.reset();
        this.router.navigateByUrl('');
      }
    });
  }

  ngOnDestroy() {
    try {
      this.timerRunning = true;
      this.authService.logOutExpiredUser();
    } catch (error) {
      console.error('Error during logout expired', error);
    }
  }

  onSubmit() {
    try {
      this.logInUser();
    } catch (error: LoggingError | any) {
      if (error instanceof LoggingError) {
        if (error.type === 'IN') {
          console.error('Error submitting form during login', error.message);
        }
      } else {
        console.error('Error', error);
      }

      this.snackBar.open('Error submitting login form', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }

  logOutUser() {
    try {
      this.timerRunning = false;
      this.authService.logOutUser();
      this.loginForm.reset();
    } catch (error: LoggingError | any) {
      if (error instanceof LoggingError) {
        if (error.type === 'OUT') {
          console.error('Error during logout', error.message);
        }
      } else {
        console.error('Error', error);
      }
      this.snackBar.open('Error logging out', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }
  logInUser() {
    try {
      this.timerRunning = true;
      this.authService.logInUser();
      const user = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };
      this.store.dispatch(
        login({
          request: { isLoggedIn: true, user: user, isTokenExpired: false },
        })
      );
      this.router.navigateByUrl('dashboard');
    } catch (error) {
      throw error;
    }
  }

  get getPasswordVisibility() {
    return this.hidePassword;
  }
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
