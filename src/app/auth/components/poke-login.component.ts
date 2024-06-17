import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { PokeState } from '../../store/app.state';
import { login } from '../store/auth.actions';
import {
  selectIsTokenExpired,
  selectLoggedInStatus,
} from '../store/auth.selectors';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../types/user.interface';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { ToasterService } from '../../shared/services/toaster.service';
import { take } from 'rxjs';
import { PasswordModule } from 'primeng/password';
import { LABELS } from '../../shared/i18n.it';

@Component({
  selector: 'poke-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    PasswordModule,
  ],
  templateUrl: './poke-login.component.html',
  styleUrl: './poke-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokeLoginComponent {
  LABELS = LABELS;
  loginForm: FormGroup;
  isUserLoggedIn$ = this.store.select(selectLoggedInStatus);
  user!: User;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<PokeState>,
    private router: Router,
    private authService: AuthService,
    private toasterService: ToasterService
  ) {
    this.loginForm = this.formBuilder.group({
      // email: ['', [Validators.required, Validators.email]],
      // password: ['', Validators.required],
      email: ['natalia@hiop.it', [Validators.required, Validators.email]],
      password: ['nubilife', Validators.required],
    });
  }

  ngOnInit() {
    this.store
      .select(selectIsTokenExpired)
      .pipe(take(1))
      .subscribe((isExpired) => {
        if (isExpired && !this.authService.turnOffLogOutTimer) {
          this.loginForm.reset();
          this.toasterService.showInfoMessage(
            'Token expired, please log in again'
          );
        }
      });
  }

  onSubmit() {
    this.user = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    try {
      // throw new Error('Submit button error');
      this.authService.logInUser();
      this.startTimerAndLogOut();
      this.router.navigateByUrl('dashboard');
      this.store.dispatch(
        login({
          request: { isLoggedIn: true, user: this.user, isTokenExpired: false },
        })
      );
      this.toasterService.showSuccessMessage('Login successful');
    } catch (error) {
      const message = 'Error submitting login form';
      console.error('Error', error);
      this.toasterService.showErrorMessage(message);
    }
  }

  onLogOutUser() {
    try {
      // throw new Error('Log out user button error');
      this.authService.logOutUser();
      this.loginForm.reset();
      this.toasterService.showSuccessMessage('Log out successful');
    } catch (error) {
      const message = 'Error log out user';
      console.error('Error', error);
      this.toasterService.showErrorMessage(message);
    }
  }

  startTimerAndLogOut() {
    try {
      // throw new Error('Start timer and log out error');
      this.authService.logOutExpiredUser();
    } catch (error) {
      throw error;
    }
  }
}
