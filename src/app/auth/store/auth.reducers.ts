import { createFeature, createReducer, on } from '@ngrx/store';
import { login } from './auth.actions';
import { AuthState } from './auth.state';

export const initialState: AuthState = {
  isLoggedIn: false,
  user: {
    email: '',
    password: '',
  },
  isTokenExpired: false,
};

const authReducer = createReducer(
  initialState,
  on(login, (state, { request }) => ({
    ...state,
    isLoggedIn: request.isLoggedIn,
    user: request.user,
    isTokenExpired: request.isTokenExpired,
  }))
);

export const authFeature = createFeature({
  name: 'authentication',
  reducer: authReducer,
});
