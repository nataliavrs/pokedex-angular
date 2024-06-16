import { createAction, props } from '@ngrx/store';
import { AuthState } from './auth.state';

export const login = createAction(
  '[Auth] Login',
  props<{ request: AuthState }>()
);
