import { inject, Injectable, signal } from '@angular/core';
import { PokemonService } from './pokemon.service';

export interface TeamMember {
  name: string;
  image: string;
  types: string[];
  stats: { name: string; value: number }[];
}

@Injectable({ providedIn: 'root' })
export class TeamBuilderService {
  private readonly pokemonService = inject(PokemonService);

  /** Reactive signal containing the 0-6 selected team Pokémon. */
  readonly team = signal<TeamMember[]>([]);

  constructor() {
    this.loadTeamFromStorage();
  }

  private loadTeamFromStorage(): void {
    try {
      const stored = localStorage.getItem('pokemon_team');
      if (stored) {
        this.team.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading team from storage:', e);
    }
  }

  private saveTeamToStorage(teamList: TeamMember[]): void {
    try {
      localStorage.setItem('pokemon_team', JSON.stringify(teamList));
    } catch (e) {
      console.error('Error saving team to storage:', e);
    }
  }

  /**
   * Checks if a Pokémon is already in the team.
   */
  isInTeam(name: string): boolean {
    return this.team().some((m) => m.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Toggles team membership for a Pokémon.
   */
  toggleTeamMember(name: string): void {
    const lowerName = name.toLowerCase();
    if (this.isInTeam(lowerName)) {
      this.removeFromTeam(lowerName);
    } else {
      this.addToTeam(lowerName);
    }
  }

  /**
   * Adds a new member to the team, first requesting details to retrieve its types and stats.
   */
  addToTeam(name: string): void {
    const lowerName = name.toLowerCase();
    const currentTeam = this.team();

    if (currentTeam.length >= 6) {
      alert('Your team is full! You can only have a maximum of 6 Pokémon.');
      return;
    }

    if (this.isInTeam(lowerName)) return;

    this.pokemonService.getPokemonDetail(lowerName).subscribe({
      next: (detail) => {
        const newMember: TeamMember = {
          name: detail.name,
          image: detail.sprites.front_default,
          types: detail.types.map((t) => t.type.name),
          stats: detail.stats.map((s) => ({
            name: s.stat.name,
            value: s.base_stat,
          })),
        };

        const updatedTeam = [...this.team(), newMember];
        this.team.set(updatedTeam);
        this.saveTeamToStorage(updatedTeam);
      },
      error: (err) => {
        console.error('Error adding Pokémon to team:', err);
      },
    });
  }

  /**
   * Removes a Pokémon from the team.
   */
  removeFromTeam(name: string): void {
    const lowerName = name.toLowerCase();
    const updatedTeam = this.team().filter((m) => m.name.toLowerCase() !== lowerName);
    this.team.set(updatedTeam);
    this.saveTeamToStorage(updatedTeam);
  }

  /**
   * Clears the entire team.
   */
  clearTeam(): void {
    this.team.set([]);
    this.saveTeamToStorage([]);
  }
}
