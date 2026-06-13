import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonListItem, PokemonService, PokemonDetail } from '../../../core/services/pokemon.service';
import { MiniGamesService } from '../../../core/services/mini-games.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-trivia',
  imports: [RouterLink, LoaderComponent, CapitalizePipe],
  templateUrl: './trivia.component.html',
  styleUrl: './trivia.component.scss',
})
export class TriviaComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  readonly miniGamesService = inject(MiniGamesService);

  // Kanto Pokémon pool (151) to generate distractor options
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
        alert('Error starting the mini-game.');
      },
    });
  }

  /**
   * Starts a new round by selecting a target Pokémon and 3 distractors.
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

        // Generate 3 unique distractors that do not match the target or each other
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
      },
      error: () => {
        this.loading.set(false);
        alert('Error loading the next round.');
      },
    });
  }

  /**
   * Evaluates the option selected by the user and updates scores.
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
   * Plays the vocalization / sound of the target Pokémon.
   */
  playCry(): void {
    const detail = this.currentPokemon();
    if (detail?.cries?.latest) {
      const audio = new Audio(detail.cries.latest);
      audio.volume = 0.15;
      audio.play().catch((e) => console.log('Autoplay blocked by browser policy:', e));
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
