import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pokemon-detail',
  imports: [],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonDetailComponent { }
