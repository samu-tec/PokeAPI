import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
// import { PokemonListComponent } from '../pokemon-list/pokemon-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, /* PokemonCardComponent, PokemonListComponent */],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // title = 'PokeAPI';
}
