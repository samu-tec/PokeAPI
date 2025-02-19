import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';

@Component({
  selector: 'app-pokemon-list',
  imports: [PokemonDetailComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonListComponent {
  public pokemons = [
    { name: 'Pikachu', src: 'https://img.pokemondb.net/artwork/large/pikachu.jpg', habilities: ['Electric', 'Thunder'] },
    { name: 'Charmander', src: 'https://img.pokemondb.net/artwork/large/charmander.jpg', habilities: ['Fire', 'Flame'] },
    { name: 'Squirtle', src: 'https://img.pokemondb.net/artwork/large/squirtle.jpg', habilities: ['Water', 'Bubble'] },
    { name: 'Bulbasaur', src: 'https://img.pokemondb.net/artwork/large/bulbasaur.jpg', habilities: ['Grass', 'Poison'] }

  ]
  clickName(frase: string) {
    console.log(frase);
  }
}
