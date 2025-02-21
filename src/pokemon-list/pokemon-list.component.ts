import {
  /* ChangeDetectionStrategy, */ Component,
  inject,
} from '@angular/core';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonServiceService } from '../pokemon-service.service';
import { PaginatorComponent } from '../paginator/paginator.component';
import { Router } from '@angular/router';
// import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-pokemon-list',
  imports: [PokemonCardComponent, PaginatorComponent /* JsonPipe */],
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

  pages?: any; // ? significa que es opcional y ! significa que no es null

  private pokemonService = inject(PokemonServiceService);

  private router = inject(Router);

  constructor() {
    this.pokemonService.getPokemonList().subscribe((data) => {
      this.pokemons = data.results;
      this.pages = { next: data.next, previous: data.previous };
      // console.log('data', data.results);
    });
  }

  clickName(pokemon: string) {
    this.router.navigate(['/pokemon/', pokemon]);
  }

  capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  nextPage() {
    // console.log('Siguiente página');
    if (this.pages.next) {
      this.pokemonService.changePage(this.pages.next).subscribe((data) => {
        this.pokemons = data.results;
        this.pages = { next: data.next, previous: data.previous };
      });
    }
  }

  prevPage() {
    // console.log('Página anterior');
    if (this.pages.previous) {
      this.pokemonService.changePage(this.pages.previous).subscribe((data) => {
        this.pokemons = data.results;
        this.pages = { next: data.next, previous: data.previous };
      });
    }
  }
}
