import { /* ChangeDetectionStrategy, */ Component, inject } from '@angular/core';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';
import { PokemonServiceService } from '../pokemon-service.service';
import { PaginatorComponent } from '../paginator/paginator.component';
// import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-pokemon-list',
  imports: [PokemonDetailComponent, PaginatorComponent/* JsonPipe */],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PokemonListComponent {
  /*   public pokemons = [
      { name: 'Pikachu', src: 'https://img.pokemondb.net/artwork/large/pikachu.jpg', habilities: ['Electric', 'Thunder'] },
      { name: 'Charmander', src: 'https://img.pokemondb.net/artwork/large/charmander.jpg', habilities: ['Fire', 'Flame'] },
      { name: 'Squirtle', src: 'https://img.pokemondb.net/artwork/large/squirtle.jpg', habilities: ['Water', 'Bubble'] },
      { name: 'Bulbasaur', src: 'https://img.pokemondb.net/artwork/large/bulbasaur.jpg', habilities: ['Grass', 'Poison'] }
    ] */

  // TODO: Cambiar el tipo de la variable pokemons a any[]
  public pokemons: any[] = [];

  private pokemonService = inject(PokemonServiceService);

  constructor() {
    this.pokemonService.getPokemonList().subscribe((data) => {
      this.pokemons = data.results;
      // console.log('data', data.results);
    });
  }

  clickName(frase: string) {
    console.log(frase);
  }

  capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  nextPage() {
    console.log('Siguiente página');
  }

  prevPage() {
    console.log('Página anterior');
  }
  
}
