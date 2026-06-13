import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonListItem, PokemonService, PokemonDetail } from '../../../core/services/pokemon.service';
import { MiniGamesService } from '../../../core/services/mini-games.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-type-quiz',
  imports: [RouterLink, LoaderComponent, CapitalizePipe],
  templateUrl: './type-quiz.component.html',
  styleUrl: './type-quiz.component.scss',
})
export class TypeQuizComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  readonly miniGamesService = inject(MiniGamesService);

  private kantoPool: PokemonListItem[] = [];

  readonly loading = signal<boolean>(true);
  readonly currentPokemon = signal<PokemonDetail | undefined>(undefined);
  readonly options = signal<string[]>([]);
  readonly answered = signal<boolean>(false);
  readonly selectedAnswer = signal<string>('');
  readonly isCorrect = signal<boolean>(false);

  private readonly canonicalTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  ngOnInit(): void {
    this.pokemonService.getPokemonByRegion(0, 151).subscribe({
      next: (data) => {
        this.kantoPool = data.results;
        this.nextRound();
      },
      error: () => {
        this.loading.set(false);
        alert('Error starting the type quiz.');
      },
    });
  }

  /**
   * Starts the next round by picking a random Pokémon and compiling options.
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

        // Correct answer is the primary type
        const correctType = detail.types[0].type.name.toLowerCase();

        // Get all types that this Pokémon possesses
        const actualTypes = detail.types.map((t) => t.type.name.toLowerCase());

        // Select 3 distractors from canonical types that this Pokémon does NOT have
        const distractors: string[] = [];
        const pool = this.canonicalTypes.filter((t) => !actualTypes.includes(t));

        while (distractors.length < 3) {
          const randIdx = Math.floor(Math.random() * pool.length);
          const candidate = pool[randIdx];
          if (!distractors.includes(candidate)) {
            distractors.push(candidate);
          }
        }

        const allOptions = [correctType, ...distractors];
        this.options.set(this.shuffleArray(allOptions));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Error loading the next Pokémon detail.');
      },
    });
  }

  /**
   * Selection handler. Checks answer correctness and plays sound.
   */
  selectOption(option: string): void {
    if (this.answered()) return;

    this.answered.set(true);
    this.selectedAnswer.set(option);

    const correctType = this.currentPokemon()?.types[0].type.name.toLowerCase();
    const correct = option.toLowerCase() === correctType;
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

  /**
   * Returns a matching color code for type-based button elements.
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

  private shuffleArray(array: string[]): string[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
