import { Component, inject } from '@angular/core';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonListItem, PokemonServiceService } from '../pokemon-service/pokemon-service.service';
import { PaginatorComponent } from '../paginator/paginator.component';
import { Router } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { CapitalizePipe } from '../capitalize/capitalize.pipe';

@Component({
  selector: 'app-pokemon-list',
  imports: [PokemonCardComponent, PaginatorComponent, LoaderComponent, CapitalizePipe],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
})
export class PokemonListComponent {
  public pokemons: PokemonListItem[] = [];
  pages?: { next: string | null; previous: string | null };
  private pokemonService = inject(PokemonServiceService);
  private router = inject(Router);
  loading: boolean = true;

  constructor() {
    this.loading = true;
    this.pokemonService.getPokemonList().subscribe((data) => {
      setTimeout(() => {
        this.pokemons = data.results;
        this.pages = { next: data.next, previous: data.previous };
        this.loading = false;
      }, 150);
    });
  }

  clickName(pokemon: string) {
    this.router.navigate(['/pokemon/', pokemon.toLowerCase()]);
  }

  nextPage() {
    if (this.pages?.next) {
      this.loading = true;
      this.pokemonService.changePage(this.pages.next).subscribe((data) => {
        setTimeout(() => {
          this.pokemons = data.results;
          this.pages = { next: data.next, previous: data.previous };
          this.loading = false;
        }, 150);
      });
    }
  }

  prevPage() {
    if (this.pages?.previous) {
      this.loading = true;
      this.pokemonService.changePage(this.pages.previous).subscribe((data) => {
        setTimeout(() => {
          this.pokemons = data.results;
          this.pages = { next: data.next, previous: data.previous };
          this.loading = false;
        }, 150);
      });
    }
  }
}
