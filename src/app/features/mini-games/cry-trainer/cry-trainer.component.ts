import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonListItem, PokemonService, PokemonDetail } from '../../../core/services/pokemon.service';
import { MiniGamesService } from '../../../core/services/mini-games.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-cry-trainer',
  imports: [RouterLink, LoaderComponent, CapitalizePipe],
  templateUrl: './cry-trainer.component.html',
  styleUrl: './cry-trainer.component.scss',
})
export class CryTrainerComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  readonly miniGamesService = inject(MiniGamesService);

  private kantoPool: PokemonListItem[] = [];

  readonly loading = signal<boolean>(true);
  readonly currentPokemon = signal<PokemonDetail | undefined>(undefined);
  readonly options = signal<string[]>([]);
  readonly answered = signal<boolean>(false);
  readonly selectedAnswer = signal<string>('');
  readonly isCorrect = signal<boolean>(false);

  ngOnInit(): void {
    this.pokemonService.getPokemonByRegion(0, 151).subscribe({
      next: (data) => {
        this.kantoPool = data.results;
        this.nextRound();
      },
      error: () => {
        this.loading.set(false);
        alert('Error starting Cry Trainer.');
      },
    });
  }

  /**
   * Starts a new round. Selects a target Pokémon, sets distractors, shuffles options,
   * and plays the cry.
   */
  nextRound(): void {
    if (this.kantoPool.length === 0) return;
    this.loading.set(true);
    this.answered.set(false);
    this.selectedAnswer.set('');
    this.isCorrect.set(false);
    this.currentPokemon.set(undefined);

    const randomIndex = Math.floor(Math.random() * this.kantoPool.length);
    const target = this.kantoPool[randomIndex];

    this.pokemonService.getPokemonDetail(target.name).subscribe({
      next: (detail) => {
        this.currentPokemon.set(detail);

        // Generate 3 unique distractors that do not match the target
        const distractors: string[] = [];
        while (distractors.length < 3) {
          const randIdx = Math.floor(Math.random() * this.kantoPool.length);
          const randName = this.kantoPool[randIdx].name;
          if (randName !== detail.name && !distractors.includes(randName)) {
            distractors.push(randName);
          }
        }

        const allOptions = [detail.name, ...distractors];
        this.options.set(this.shuffleArray(allOptions));
        this.loading.set(false);

        // Play the cry immediately on new round load (gracefully handled if blocked)
        setTimeout(() => this.playCry(), 200);
      },
      error: () => {
        this.loading.set(false);
        alert('Error loading next round.');
      },
    });
  }

  /**
   * Selection handler. Verifies option correctness, plays cry, and updates global stats.
   */
  selectOption(option: string): void {
    if (this.answered()) return;

    this.answered.set(true);
    this.selectedAnswer.set(option);

    const correct = option.toLowerCase() === this.currentPokemon()?.name.toLowerCase();
    this.isCorrect.set(correct);

    if (correct) {
      this.miniGamesService.incrementScore();
    } else {
      this.miniGamesService.resetStreak();
    }

    this.playCry();
  }

  /**
   * Play target Pokémon cry (soft capped at 0.35 volume).
   */
  playCry(): void {
    const detail = this.currentPokemon();
    if (detail?.cries?.latest) {
      const audio = new Audio(detail.cries.latest);
      audio.volume = 0.15;
      audio.play().catch((e) => console.log('Audio playback blocked:', e));
    }
  }

  private shuffleArray(array: string[]): string[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
