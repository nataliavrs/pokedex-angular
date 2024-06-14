import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

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

  constructor(private formBuilder: FormBuilder) {}

  onSubmit() {
    console.log('this.loginForm', this.loginForm.value);
  }
}
