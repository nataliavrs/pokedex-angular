import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { PokeState } from '../../store/app.state';
import { login } from '../store/auth.actions';
import { selectLoggedInStatus, selectUser } from '../store/auth.selectors';
import { Router } from '@angular/router';

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
  ],
  templateUrl: './poke-login.component.html',
  styleUrl: './poke-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokeLoginComponent {
  loginForm: FormGroup = this.formBuilder.group({
    email: '',
    password: '',
  });

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<PokeState>,
    private router: Router
  ) {}

  onSubmit() {
    // Validate form
    // Manage form errors
    // Generate random token
    // Dispatch user's information and token to store
    const user = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };
    // Dispatch isLoggedIn to store
    // If valid
    this.store.dispatch(login({ request: { isLoggedIn: true, user: user } }));
    this.store.select(selectLoggedInStatus).subscribe((isLoggedIn) => {
      console.log('isLoggedIn', isLoggedIn);
    });
    // Navigate to dashboard
    this.router.navigateByUrl('dashboard');
  }
}
