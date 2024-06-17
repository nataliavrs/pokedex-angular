import { User } from '../types/user.interface';

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isTokenExpired: boolean;
}
