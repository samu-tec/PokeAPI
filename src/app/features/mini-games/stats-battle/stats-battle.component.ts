import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PokemonListItem, PokemonService, PokemonDetail } from '../../../core/services/pokemon.service';
import { MiniGamesService } from '../../../core/services/mini-games.service';
import { UpperCasePipe } from '@angular/common';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';

export interface DuelStat {
  name: string;
  label: string;
  value: number;
}

@Component({
  selector: 'app-stats-battle',
  imports: [RouterLink, LoaderComponent, CapitalizePipe, UpperCasePipe],
  templateUrl: './stats-battle.component.html',
  styleUrl: './stats-battle.component.scss',
})
export class StatsBattleComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  readonly miniGamesService = inject(MiniGamesService);

  private kantoPool: PokemonListItem[] = [];

  readonly loading = signal<boolean>(true);
  readonly playerPokemon = signal<PokemonDetail | undefined>(undefined);
  readonly aiPokemon = signal<PokemonDetail | undefined>(undefined);
  readonly answered = signal<boolean>(false);
  readonly selectedStatName = signal<string>('');
  readonly resultStatus = signal<'victory' | 'defeat' | 'draw' | ''>('');

  readonly playerStats = signal<DuelStat[]>([]);
  readonly aiStats = signal<DuelStat[]>([]);

  readonly searchQuery = signal<string>('');
  readonly filteredPool = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    return this.kantoPool
      .filter((p) => p.name.toLowerCase().includes(query))
      .slice(0, 6);
  });

  ngOnInit(): void {
    this.pokemonService.getPokemonByRegion(0, 151).subscribe({
      next: (data) => {
        this.kantoPool = data.results;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Error starting Stats Battle.');
      },
    });
  }

  /**
   * Draws a new random opponent for the AI while keeping the player's current Pokémon.
   */
  startNewDuel(): void {
    const player = this.playerPokemon();
    if (!player || this.kantoPool.length === 0) return;

    this.loading.set(true);
    this.answered.set(false);
    this.selectedStatName.set('');
    this.resultStatus.set('');
    this.aiPokemon.set(undefined);
    this.aiStats.set([]);

    // Select a random AI opponent
    let indexAI = Math.floor(Math.random() * this.kantoPool.length);
    let attempts = 0;
    while (
      attempts < 10 &&
      this.kantoPool[indexAI].name.toLowerCase() === player.name.toLowerCase()
    ) {
      indexAI = Math.floor(Math.random() * this.kantoPool.length);
      attempts++;
    }

    const nameAI = this.kantoPool[indexAI].name;

    this.pokemonService.getPokemonDetail(nameAI).subscribe({
      next: (aiDetail) => {
        this.aiPokemon.set(aiDetail);
        this.aiStats.set(this.extractStats(aiDetail));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('StatsBattle - Error loading AI opponent:', err);
        this.loading.set(false);
        alert('Error loading AI opponent.');
      },
    });
  }

  /**
   * Searches and selects the player's Pokémon and rolls a random AI opponent.
   */
  selectPlayerPokemon(name: string): void {
    if (this.kantoPool.length === 0) return;

    this.searchQuery.set('');
    this.loading.set(true);
    this.answered.set(false);
    this.selectedStatName.set('');
    this.resultStatus.set('');
    this.playerPokemon.set(undefined);
    this.aiPokemon.set(undefined);
    this.playerStats.set([]);
    this.aiStats.set([]);

    // Select a random AI opponent
    let indexAI = Math.floor(Math.random() * this.kantoPool.length);
    let attempts = 0;
    while (
      attempts < 10 &&
      this.kantoPool[indexAI].name.toLowerCase() === name.toLowerCase()
    ) {
      indexAI = Math.floor(Math.random() * this.kantoPool.length);
      attempts++;
    }
    const nameAI = this.kantoPool[indexAI].name;

    forkJoin({
      player: this.pokemonService.getPokemonDetail(name),
      ai: this.pokemonService.getPokemonDetail(nameAI),
    }).subscribe({
      next: (res) => {
        if (!res.player || !res.ai) {
          this.loading.set(false);
          alert('Error loading Pokémon details.');
          return;
        }
        this.playerPokemon.set(res.player);
        this.aiPokemon.set(res.ai);
        this.playerStats.set(this.extractStats(res.player));
        this.aiStats.set(this.extractStats(res.ai));
        this.loading.set(false);
        this.playCry(res.player);
      },
      error: (err) => {
        console.error('StatsBattle - Error fetching details:', err);
        this.loading.set(false);
        alert('Error loading duelists.');
      },
    });
  }

  clearPlayerPokemon(): void {
    this.playerPokemon.set(undefined);
    this.aiPokemon.set(undefined);
    this.playerStats.set([]);
    this.aiStats.set([]);
    this.answered.set(false);
    this.selectedStatName.set('');
    this.resultStatus.set('');
    this.searchQuery.set('');
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  getPokemonId(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2] || parts[parts.length - 3] || '1';
  }

  getPokemonSpriteUrl(url: string): string {
    const id = this.getPokemonId(url);
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  /**
   * Compares the player's selected stat with the AI's matching stat.
   */
  duelStat(statName: string): void {
    if (this.answered() || !this.playerPokemon() || !this.aiPokemon()) return;

    this.answered.set(true);
    this.selectedStatName.set(statName);

    const pValue = this.playerStats().find((s) => s.name === statName)?.value ?? 0;
    const aValue = this.aiStats().find((s) => s.name === statName)?.value ?? 0;

    if (pValue > aValue) {
      this.resultStatus.set('victory');
      this.miniGamesService.incrementScore();
    } else if (pValue < aValue) {
      this.resultStatus.set('defeat');
      this.miniGamesService.resetStreak();
    } else {
      this.resultStatus.set('draw');
    }

    this.playCry(this.aiPokemon()!);
  }

  private extractStats(detail: PokemonDetail): DuelStat[] {
    // We map HP (index 0), Attack (index 1), Defense (index 2), Speed (index 5)
    return [
      { name: 'hp', label: 'HP', value: detail.stats[0]?.base_stat ?? 0 },
      { name: 'attack', label: 'ATK', value: detail.stats[1]?.base_stat ?? 0 },
      { name: 'defense', label: 'DEF', value: detail.stats[2]?.base_stat ?? 0 },
      { name: 'speed', label: 'SPD', value: detail.stats[5]?.base_stat ?? 0 },
    ];
  }

  /**
   * Play vocalization cry (soft capped at 0.35 volume).
   */
  playCry(detail: PokemonDetail): void {
    if (detail?.cries?.latest) {
      const audio = new Audio(detail.cries.latest);
      audio.volume = 0.15;
      audio.play().catch((e) => console.log('Audio playback blocked:', e));
    }
  }
}
