import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonServiceService } from '../pokemon-service/pokemon-service.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './pokemon.component.html',
  styleUrl: './pokemon.component.scss',
})
export class PokemonComponent {
  private router = inject(ActivatedRoute);
  private pokemonService = inject(PokemonServiceService);
  pokemon?: any; // Puede ser any o undefined
  pokemonName: string | null = null;
  loading: boolean = true;

  constructor() {
    this.pokemonName = this.router.snapshot.params['pokemonId'];
    this.getPokemonDetail(this.pokemonName);
  }

  getPokemonDetail(pokemonId: string | null): void {
    if (pokemonId) {
      this.loading = true;
      setTimeout(() => {
        this.pokemonService.getPokemonDetail(pokemonId).subscribe((data) => {
          this.pokemon = data;
          this.loading = false;
        });
      }, 500);
    }
  }

  capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
