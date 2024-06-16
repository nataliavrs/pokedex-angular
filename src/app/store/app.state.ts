import { AuthState } from '../auth/store/auth.state';
import { User } from '../auth/types/user.interface';

export interface PokeState {
  authentication: AuthState;
  user: User;
}
