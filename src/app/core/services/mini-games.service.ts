import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MiniGamesService {
  readonly score = signal<number>(0);
  readonly streak = signal<number>(0);

  /**
   * Increments the user's score and active streak by 1.
   */
  incrementScore(): void {
    this.score.update((s) => s + 1);
    this.streak.update((s) => s + 1);
  }

  /**
   * Resets the active streak to 0.
   */
  resetStreak(): void {
    this.streak.set(0);
  }
}
