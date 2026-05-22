import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { PokemonDetail, PokemonService } from '../../core/services/pokemon.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, LoaderComponent, CapitalizePipe],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private pokemonService = inject(PokemonService);

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
    this.location.back();
  }

  getTypeColor(typeName: string): string {
    const colors: Record<string, string> = {
      normal: '#A8A878', fire: '#F08030', water: '#6890F0',
      electric: '#F8D030', grass: '#78C850', ice: '#98D8D8',
      fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
      flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
      rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
      dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC',
    };
    return colors[typeName] ?? '#A8A878';
  }

  getStatLabel(statName: string): string {
    const labels: Record<string, string> = {
      hp: 'HP', attack: 'ATK', defense: 'DEF',
      'special-attack': 'Sp.ATK', 'special-defense': 'Sp.DEF', speed: 'SPD',
    };
    return labels[statName] ?? statName;
  }

  getStatColor(value: number): string {
    if (value < 50) return '#e53935';
    if (value < 80) return '#f9a825';
    if (value < 110) return '#43a047';
    return '#1e88e5';
  }

  formatHeight(h: number): string {
    return (h / 10).toFixed(1) + ' m';
  }

  formatWeight(w: number): string {
    return (w / 10).toFixed(1) + ' kg';
  }
}
