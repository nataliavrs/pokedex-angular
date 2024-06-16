import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PokeState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { selectUser } from '../../auth/store/auth.selectors';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { User } from '../../auth/types/user.interface';

@Component({
  selector: 'poke-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poke-dashboard.component.html',
  styleUrl: './poke-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokeDashboardComponent {
  user$: Observable<User> = this.store.select(selectUser);

  constructor(private store: Store<PokeState>) {}
}
