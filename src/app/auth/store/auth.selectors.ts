import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthFeature =
  createFeatureSelector<AuthState>('authentication');

export const selectLoggedInStatus = createSelector(
  selectAuthFeature,
  (state: AuthState) => state.isLoggedIn
);

export const selectUser = createSelector(
  selectAuthFeature,
  (state: AuthState) => state.user
);
