import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonDetail, PokemonServiceService } from '../pokemon-service/pokemon-service.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { CapitalizePipe } from '../capitalize/capitalize.pipe';

@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [CommonModule, LoaderComponent, CapitalizePipe],
  templateUrl: './pokemon.component.html',
  styleUrl: './pokemon.component.scss',
})
export class PokemonComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pokemonService = inject(PokemonServiceService);

  pokemon?: PokemonDetail;
  pokemonName: string | null = null;
  loading = true;
  pokeballOpen = false;

  constructor() {
    this.pokemonName = this.route.snapshot.params['pokemonId'];
  }

  ngOnInit(): void {
    this.pokemonService.getPokemonDetail(this.pokemonName!).subscribe((data) => {
      this.pokemon = data;
      this.loading = false;
      setTimeout(() => (this.pokeballOpen = true), 600);
    });
  }

  goBack(): void {
    this.router.navigate(['/pokemon-list']);
  }
}
