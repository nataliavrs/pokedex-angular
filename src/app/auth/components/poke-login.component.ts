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
} from '../store/auth.selectors';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../types/user.interface';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

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
  ],
  providers: [MessageService],
  templateUrl: './poke-login.component.html',
  styleUrl: './poke-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokeLoginComponent {
  loginForm: FormGroup = this.formBuilder.group({
    // email: ['', [Validators.required, Validators.email]],
    // password: ['', Validators.required],
    // TODO MOCK DATA
    email: ['nubi@email.it', [Validators.required, Validators.email]],
    password: ['123', Validators.required],
  });
  hidePassword: boolean = true;
  isTokenTimerRunning: boolean = false;
  isUserLoggedIn$ = this.store.select(selectLoggedInStatus);
  user!: User;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<PokeState>,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.store.select(selectIsTokenExpired).subscribe((isExpired) => {
      if (!this.authService.turnOffLogOutTimer && isExpired) {
        this.loginForm.reset();
        this.router.navigateByUrl('');
      }
    });
  }

  startTimerAndLogOut(user: User) {
    try {
      // throw new Error('Start timer and log out error');
      this.authService.logOutExpiredUser();
    } catch (error) {
      throw error;
    }
  }

  onSubmit() {
    try {
      throw new Error('Submit button error');
      this.user = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };
      this.authService.logInUser();
      this.startTimerAndLogOut(this.user);
      this.router.navigateByUrl('dashboard');
      this.store.dispatch(
        login({
          request: { isLoggedIn: true, user: this.user, isTokenExpired: false },
        })
      );
    } catch (error) {
      const message = 'Error submitting login form';
      console.error('Error', error);
      this.showErrorMessage(message);
    }
  }

  logOutUser() {
    try {
      // throw new Error('Log out user button error');
      this.isTokenTimerRunning = false;
      this.authService.logOutUser();
      this.loginForm.reset();
    } catch (error) {
      const message = 'Error log out user';
      console.error('Error', error);
      this.showErrorMessage(message);
    }
  }

  showInfoMessage(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info Message',
      detail: 'Message Content',
      key: 'tl',
      life: 3000,
    });
  }
  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });
  }

  showWarningMessage(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info Message',
      detail: 'Message Content',
      key: 'tl',
      life: 3000,
    });
  }

  // showErrorMessage(message: string): void {
  //   this.snackBar.open(message, 'Close', {
  //     duration: 2000,
  //     horizontalPosition: 'end',
  //     verticalPosition: 'top',
  //   });
  // }

  // showInfoMessage(message: string): void {
  //   this.snackBar.open(message, 'Close', {
  //     duration: 2000,
  //     horizontalPosition: 'end',
  //     verticalPosition: 'top',
  //   });
  // }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  get getPasswordVisibility() {
    return this.hidePassword;
  }
}
