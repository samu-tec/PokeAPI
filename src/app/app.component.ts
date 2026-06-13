import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

const KNOWN_REGIONS = ['all', 'kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];
const CANONICAL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

function isTypeCombination(param: string): boolean {
  const parts = param.toLowerCase().split('-');
  return parts.length > 0 && parts.every((part) => CANONICAL_TYPES.includes(part));
}

/**
 * Root component of the application.
 * Renders the header logo and the `<router-outlet>` where views are injected.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly showMenu = signal<boolean>(true);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects.split('?')[0];
        const segments = url.split('/').filter((s) => s);

        if (segments.length === 2 && segments[0].toLowerCase() === 'pokedex') {
          const param = segments[1].toLowerCase();
          const isRegion = KNOWN_REGIONS.includes(param);
          const isType = isTypeCombination(param);

          if (!isRegion && !isType) {
            this.showMenu.set(false);
            return;
          }
        }

        if (segments.length >= 2 && segments[0].toLowerCase() === 'mini-games') {
          this.showMenu.set(false);
          return;
        }

        this.showMenu.set(true);
      });
  }

  /** Navigates to the root path when the logo is clicked (returns to the Pokémon list). */
  onLogoClick() {
    this.router.navigate(['/']);
  }
}
