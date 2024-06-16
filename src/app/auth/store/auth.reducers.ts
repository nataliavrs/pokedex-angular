import { createFeature, createReducer, on } from '@ngrx/store';
import { login } from './auth.actions';
import { AuthState } from './auth.state';

export const initialState: AuthState = {
  isLoggedIn: false,
};

const authReducer = createReducer(
  initialState,
  on(login, (state) => ({
    ...state,
    isLoggedIn: true,
  }))
);

export const authFeature = createFeature({
  name: 'authentication',
  reducer: authReducer,
});
