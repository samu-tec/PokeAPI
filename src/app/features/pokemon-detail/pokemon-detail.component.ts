import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PokemonDetail, PokemonService } from '../../core/services/pokemon.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';

export interface EvolutionInfo {
  name: string;
  image: string;
}

/**
 * Detail view of an individual Pokémon.
 *
 * Receives the identifier from the route parameter `pokemonId` (`/pokemon/:pokemonId`),
 * requests details from the `PokemonService`, and renders types, stats, abilities, and physical data.
 * Includes a Pokéball opening animation on load and supports navigating through the evolution chain.
 */
@Component({
  selector: 'app-pokemon-detail',
  imports: [LoaderComponent, CapitalizePipe],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly pokemonService = inject(PokemonService);

  /** Loaded Pokémon detail data. `undefined` while loading. */
  readonly pokemon = signal<PokemonDetail | undefined>(undefined);

  /** Active Pokémon identifier parsed from the route parameter. */
  readonly currentPokemonName = signal<string>('');

  /** True while waiting for API responses. Controls the screen loader. */
  readonly loading = signal<boolean>(true);

  /** Controls the Pokéball opening animation. Triggered 600ms after data loads. */
  readonly pokeballOpen = signal<boolean>(false);

  /** Evolution steps for the current Pokémon. */
  readonly evolutions = signal<EvolutionInfo[]>([]);

  /**
   * Subscribes to route parameter changes to allow in-page navigation between evolution links.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const name = params.get('pokemonId');
      if (name) {
        this.currentPokemonName.set(name);
        this.loadPokemon(name);
      }
    });
  }

  private loadPokemon(name: string): void {
    this.loading.set(true);
    this.pokeballOpen.set(false);
    this.pokemon.set(undefined);
    this.evolutions.set([]);

    this.pokemonService.getPokemonDetail(name).subscribe({
      next: (data) => {
        this.pokemon.set(data);

        // Fetch evolution chain data
        if (data.species?.url) {
          this.pokemonService.getPokemonSpecies(data.species.url).subscribe({
            next: (speciesData) => {
              if (speciesData.evolution_chain?.url) {
                this.pokemonService.getEvolutionChain(speciesData.evolution_chain.url).subscribe({
                  next: (evoData) => {
                    const steps = this.parseEvolutionChain(evoData.chain);
                    const list = steps.map((step) => ({
                      name: step.name,
                      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${step.id}.png`,
                    }));
                    this.evolutions.set(list);
                    this.finishLoading(data);
                  },
                  error: () => this.finishLoading(data)
                });
              } else {
                this.finishLoading(data);
              }
            },
            error: () => this.finishLoading(data)
          });
        } else {
          this.finishLoading(data);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private finishLoading(data: PokemonDetail): void {
    this.loading.set(false);
    setTimeout(() => this.pokeballOpen.set(true), 600);

    // Play the cry after the pokeball has fully opened (synced with animation)
    if (data.cries?.latest) {
      setTimeout(() => {
        const audio = new Audio(data.cries!.latest);
        audio.volume = 0.15;
        audio.play().catch(() => {
          // Ignore autoplay policy blocks
        });
      }, 1200);
    }
  }

  /**
   * Recursively parses the evolution chain returned by the PokéAPI.
   */
  private parseEvolutionChain(chain: any): { name: string; id: string }[] {
    const list: { name: string; id: string }[] = [];

    function traverse(node: any) {
      if (!node) return;
      if (node.species && node.species.name && node.species.url) {
        const parts = node.species.url.split('/').filter((p: string) => p);
        const id = parts[parts.length - 1];
        list.push({ name: node.species.name, id });
      }
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((nextBranch: any) => {
          traverse(nextBranch);
        });
      }
    }

    traverse(chain);
    return list;
  }

  /**
   * Plays the cry sound of the current Pokémon.
   */
  playCry(): void {
    const data = this.pokemon();
    if (data?.cries?.latest) {
      const audio = new Audio(data.cries.latest);
      audio.volume = 0.15;
      audio.play().catch((err) => console.error('Error playing cry:', err));
    }
  }

  /**
   * Navigates to the details page of another Pokémon (e.g. from the evolution path).
   */
  navigateToPokemon(name: string): void {
    this.router.navigate(['/pokedex', name.toLowerCase()]);
  }

  /**
   * Returns to the previous list page using browser history.
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Returns the color code for a specific elemental type.
   */
  getTypeColor(typeName: string): string {
    const name = typeName.toLowerCase().trim();
    const colors: Record<string, string> = {
      normal: '#A8A878', fire: '#F08030', water: '#6890F0',
      electric: '#F8D030', grass: '#78C850', ice: '#98D8D8',
      fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
      flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
      rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
      dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC',
    };
    return colors[name] ?? '#A8A878';
  }

  /**
   * Formats a raw API statistic name into a user-friendly short label.
   */
  getStatLabel(statName: string): string {
    const labels: Record<string, string> = {
      hp: 'HP', attack: 'ATK', defense: 'DEF',
      'special-attack': 'Sp.ATK', 'special-defense': 'Sp.DEF', speed: 'SPD',
    };
    return labels[statName] ?? statName;
  }

  /**
   * Returns a progress bar fill color according to the stat value.
   */
  getStatColor(value: number): string {
    if (value < 50) return '#e53935';
    if (value < 80) return '#f9a825';
    if (value < 110) return '#43a047';
    return '#1e88e5';
  }

  /**
   * Formats decimeters to meters.
   */
  formatHeight(h: number): string {
    return (h / 10).toFixed(1) + ' m';
  }

  /**
   * Formats hectograms to kilograms.
   */
  formatWeight(w: number): string {
    return (w / 10).toFixed(1) + ' kg';
  }
}
