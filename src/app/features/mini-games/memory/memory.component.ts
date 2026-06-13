import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PokemonListItem, PokemonService } from '../../../core/services/pokemon.service';
import { MiniGamesService } from '../../../core/services/mini-games.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';

export interface MemoryCard {
  id: number;
  pokemonId: number;
  name: string;
  image: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-memory',
  imports: [RouterLink, LoaderComponent, CapitalizePipe],
  templateUrl: './memory.component.html',
  styleUrl: './memory.component.scss',
})
export class MemoryComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  readonly miniGamesService = inject(MiniGamesService);

  private kantoPool: PokemonListItem[] = [];

  readonly loading = signal<boolean>(true);
  readonly memoryCards = signal<MemoryCard[]>([]);
  readonly selectedCardIds = signal<number[]>([]);
  readonly isCheckingMemory = signal<boolean>(false);
  readonly memoryMatches = signal<number>(0);
  readonly memoryMoves = signal<number>(0);
  readonly won = signal<boolean>(false);

  ngOnInit(): void {
    this.pokemonService.getPokemonByRegion(0, 151).subscribe({
      next: (data) => {
        this.kantoPool = data.results;
        this.startNewGame();
      },
      error: () => {
        this.loading.set(false);
        alert('Error loading Pokémon pool.');
      },
    });
  }

  /**
   * Starts a new Memory Match game by picking 4 random Pokémon,
   * fetching their official artwork, duplicating them to 8 cards, and shuffling.
   */
  startNewGame(): void {
    if (this.kantoPool.length === 0) return;
    this.loading.set(true);
    this.won.set(false);
    this.memoryMatches.set(0);
    this.memoryMoves.set(0);
    this.selectedCardIds.set([]);
    this.isCheckingMemory.set(false);

    // Select 4 random unique Pokémon from the Kanto pool
    const selected: PokemonListItem[] = [];
    while (selected.length < 4) {
      const idx = Math.floor(Math.random() * this.kantoPool.length);
      const candidate = this.kantoPool[idx];
      if (!selected.some((p) => p.name === candidate.name)) {
        selected.push(candidate);
      }
    }

    // Load detailed data (for official artwork and cry) in parallel
    const detailRequests = selected.map((p) => this.pokemonService.getPokemonDetail(p.name));
    forkJoin(detailRequests).subscribe({
      next: (details) => {
        const cards: MemoryCard[] = [];
        details.forEach((detail, index) => {
          const cardData = {
            pokemonId: detail.id,
            name: detail.name,
            image: detail.sprites.other['official-artwork'].front_default,
            flipped: false,
            matched: false,
          };
          // Create 2 matching cards for each Pokémon
          cards.push({ ...cardData, id: index * 2 });
          cards.push({ ...cardData, id: index * 2 + 1 });
        });

        this.memoryCards.set(this.shuffleArray(cards));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Error loading memory cards details.');
      },
    });
  }

  /**
   * Card click handler. Evaluates flipping and comparison logic.
   */
  onCardClick(cardId: number): void {
    if (this.isCheckingMemory()) return;
    const cards = this.memoryCards();
    const clickedCard = cards.find((c) => c.id === cardId);
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

    // Flip card face up
    this.memoryCards.update((currentCards) =>
      currentCards.map((c) => (c.id === cardId ? { ...c, flipped: true } : c))
    );

    const currentSelected = [...this.selectedCardIds(), cardId];
    this.selectedCardIds.set(currentSelected);

    if (currentSelected.length === 2) {
      this.memoryMoves.update((m) => m + 1);
      const [firstId, secondId] = currentSelected;
      const firstCard = cards.find((c) => c.id === firstId)!;
      const secondCard = cards.find((c) => c.id === secondId)!;

      if (firstCard.pokemonId === secondCard.pokemonId) {
        // MATCH: Keep cards flipped open and play cry
        this.memoryCards.update((currentCards) =>
          currentCards.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
          )
        );
        this.memoryMatches.update((m) => m + 1);
        this.selectedCardIds.set([]);
        this.playCry(firstCard.name);

        // Win check
        if (this.memoryMatches() === 4) {
          this.won.set(true);
          this.miniGamesService.incrementScore();
        }
      } else {
        // MISMATCH: Turn face-down after a short delay
        this.isCheckingMemory.set(true);
        setTimeout(() => {
          this.memoryCards.update((currentCards) =>
            currentCards.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
            )
          );
          this.selectedCardIds.set([]);
          this.isCheckingMemory.set(false);
        }, 1000);
      }
    }
  }

  /**
   * Play the vocalization/cry of a matched Pokémon (soft capped at 0.35 volume).
   */
  playCry(pokemonName: string): void {
    this.pokemonService.getPokemonDetail(pokemonName).subscribe({
      next: (detail) => {
        if (detail?.cries?.latest) {
          const audio = new Audio(detail.cries.latest);
          audio.volume = 0.15;
          audio.play().catch((e) => console.log('Audio playback blocked:', e));
        }
      },
    });
  }

  private shuffleArray(array: MemoryCard[]): MemoryCard[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
