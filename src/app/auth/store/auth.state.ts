import { User } from '../types/user.interface';

export interface AuthState {
  isLoggedIn: boolean;
  user: User;
}
