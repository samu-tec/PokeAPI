import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonServiceService } from '../pokemon-service.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-pokemon',
  imports: [JsonPipe],
  templateUrl: './pokemon.component.html',
  styleUrl: './pokemon.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonComponent {
  private router = inject(ActivatedRoute);
  private pokemonService = inject(PokemonServiceService);
  pokemon?: any; // Puede ser any o undefined
  pokemonName: string | null = null;

  constructor() {
    // console.log('---->', this.router.snapshot.params['pokemonId']);
    this.pokemonName = this.router.snapshot.params['pokemonId'];
    this.getPokemonDetail(this.pokemonName);
  }

  getPokemonDetail(pokemonId: string | null): void {
    if (pokemonId) {
      this.pokemonService.getPokemonDetail(pokemonId).subscribe((data) => {
        this.pokemon = data;
      });
    }
  }
}
