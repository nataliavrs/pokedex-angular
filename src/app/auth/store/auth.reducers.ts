import { createFeature, createReducer, on } from '@ngrx/store';
import { login } from './auth.actions';
import { AuthState } from './auth.state';

export const initialState: AuthState = {
  isLoggedIn: false,
  user: {
    email: '',
    password: '',
  },
};

const authReducer = createReducer(
  initialState,
  on(login, (state, { request }) => ({
    ...state,
    isLoggedIn: true,
    user: request.user,
  }))
);

export const authFeature = createFeature({
  name: 'authentication',
  reducer: authReducer,
});
