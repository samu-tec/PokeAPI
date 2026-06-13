import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MiniGamesService } from '../../../core/services/mini-games.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly miniGamesService = inject(MiniGamesService);
}
