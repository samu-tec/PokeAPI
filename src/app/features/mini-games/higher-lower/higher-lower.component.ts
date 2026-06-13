import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PokemonListItem, PokemonService, PokemonDetail } from '../../../core/services/pokemon.service';
import { MiniGamesService } from '../../../core/services/mini-games.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-higher-lower',
  imports: [RouterLink, LoaderComponent, CapitalizePipe],
  templateUrl: './higher-lower.component.html',
  styleUrl: './higher-lower.component.scss',
})
export class HigherLowerComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  readonly miniGamesService = inject(MiniGamesService);

  private kantoPool: PokemonListItem[] = [];

  readonly loading = signal<boolean>(true);
  readonly pokemonA = signal<PokemonDetail | undefined>(undefined);
  readonly pokemonB = signal<PokemonDetail | undefined>(undefined);
  readonly answered = signal<boolean>(false);
  readonly selectedAnswer = signal<'higher' | 'lower' | ''>('');
  readonly isCorrect = signal<boolean>(false);

  ngOnInit(): void {
    this.pokemonService.getPokemonByRegion(0, 151).subscribe({
      next: (data) => {
        this.kantoPool = data.results;
        this.nextRound();
      },
      error: () => {
        this.loading.set(false);
        alert('Error starting Higher or Lower.');
      },
    });
  }

  /**
   * Starts a new comparison round by picking two random Pokémon and loading details.
   */
  nextRound(): void {
    if (this.kantoPool.length === 0) return;
    this.loading.set(true);
    this.answered.set(false);
    this.selectedAnswer.set('');
    this.isCorrect.set(false);
    this.pokemonA.set(undefined);
    this.pokemonB.set(undefined);

    // Pick two unique random Pokémon
    let indexA = Math.floor(Math.random() * this.kantoPool.length);
    let indexB = Math.floor(Math.random() * this.kantoPool.length);
    while (indexA === indexB) {
      indexB = Math.floor(Math.random() * this.kantoPool.length);
    }

    const nameA = this.kantoPool[indexA].name;
    const nameB = this.kantoPool[indexB].name;

    forkJoin({
      a: this.pokemonService.getPokemonDetail(nameA),
      b: this.pokemonService.getPokemonDetail(nameB),
    }).subscribe({
      next: (res) => {
        this.pokemonA.set(res.a);
        this.pokemonB.set(res.b);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Error loading Pokémon details.');
      },
    });
  }

  /**
   * Evaluates if B's weight is higher/lower than A's weight.
   */
  makeGuess(guess: 'higher' | 'lower'): void {
    if (this.answered() || !this.pokemonA() || !this.pokemonB()) return;

    this.answered.set(true);
    this.selectedAnswer.set(guess);

    const weightA = this.pokemonA()!.weight;
    const weightB = this.pokemonB()!.weight;

    const correct =
      (guess === 'higher' && weightB >= weightA) ||
      (guess === 'lower' && weightB <= weightA);

    this.isCorrect.set(correct);

    if (correct) {
      this.miniGamesService.incrementScore();
    } else {
      this.miniGamesService.resetStreak();
    }

    this.playCryB();
  }

  /**
   * Play the vocalization/cry of Pokémon B (soft capped at 0.35 volume).
   */
  playCryB(): void {
    const detail = this.pokemonB();
    if (detail?.cries?.latest) {
      const audio = new Audio(detail.cries.latest);
      audio.volume = 0.15;
      audio.play().catch((e) => console.log('Audio playback blocked:', e));
    }
  }
}
