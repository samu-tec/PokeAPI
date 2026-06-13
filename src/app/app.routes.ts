import { Routes, UrlSegment } from '@angular/router';

const KNOWN_REGIONS = ['all', 'kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];

const CANONICAL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

/**
 * Checks if a string segment is a hyphen-separated combination of canonical Pokémon types.
 */
function isTypeCombination(param: string): boolean {
  const parts = param.toLowerCase().split('-');
  return parts.length > 0 && parts.every((part) => CANONICAL_TYPES.includes(part));
}

/**
 * Matches `/pokedex/:region` only if :region is a known region name.
 */
export function regionMatcher(segments: UrlSegment[]) {
  if (segments.length === 2 && segments[0].path.toLowerCase() === 'pokedex') {
    const param = segments[1].path.toLowerCase();
    if (KNOWN_REGIONS.includes(param)) {
      return {
        consumed: segments,
        posParams: { region: segments[1] }
      };
    }
  }
  return null;
}

/**
 * Matches `/pokedex/:region/:type` only if :region is a known region name and :type is a type combination.
 */
export function regionTypeMatcher(segments: UrlSegment[]) {
  if (segments.length === 3 && segments[0].path.toLowerCase() === 'pokedex') {
    const param1 = segments[1].path.toLowerCase();
    const param2 = segments[2].path.toLowerCase();
    if (KNOWN_REGIONS.includes(param1) && isTypeCombination(param2)) {
      return {
        consumed: segments,
        posParams: {
          region: segments[1],
          type: segments[2]
        }
      };
    }
  }
  return null;
}

/**
 * Matches `/pokedex/:type` only if :type is a type combination.
 */
export function typeMatcher(segments: UrlSegment[]) {
  if (segments.length === 2 && segments[0].path.toLowerCase() === 'pokedex') {
    const param = segments[1].path.toLowerCase();
    if (isTypeCombination(param)) {
      return {
        consumed: segments,
        posParams: { type: segments[1] }
      };
    }
  }
  return null;
}

/**
 * Application routes configuration.
 *
 * All views use lazy loading (`loadComponent`), which places each feature
 * in a separate bundle chunk that is loaded only when first visited.
 *
 * Routing structure:
 * - `/`                           -> redirects to `/pokedex`
 * - `/pokedex`                    -> list of all Pokémon (region = all, type = none)
 * - `/pokedex/:region`            -> list filtered by region (using regionMatcher)
 * - `/pokedex/:region/:type`      -> list filtered by region and type (using regionTypeMatcher)
 * - `/pokedex/:type`              -> list filtered by type across all regions (using typeMatcher)
 * - `/pokedex/:pokemonId`         -> detail view of a specific Pokémon by name or ID
 * - `/mini-games`                 -> dashboard of all mini-games (and sub-games e.g. /mini-games/trivia)
 * - `**`                          -> wild-card fallback (404 Page Not Found)
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pokedex',
  },
  {
    path: 'pokedex',
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list.component').then(
        (c) => c.PokemonListComponent
      ),
  },
  {
    matcher: regionMatcher,
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list.component').then(
        (c) => c.PokemonListComponent
      ),
  },
  {
    matcher: regionTypeMatcher,
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list.component').then(
        (c) => c.PokemonListComponent
      ),
  },
  {
    matcher: typeMatcher,
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list.component').then(
        (c) => c.PokemonListComponent
      ),
  },
  {
    path: 'pokedex/:pokemonId',
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-detail.component').then(
        (c) => c.PokemonDetailComponent
      ),
  },
  {
    path: 'mini-games',
    loadComponent: () =>
      import('./features/mini-games/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
  },
  {
    path: 'mini-games/trivia',
    loadComponent: () =>
      import('./features/mini-games/trivia/trivia.component').then(
        (c) => c.TriviaComponent
      ),
  },
  {
    path: 'mini-games/memory',
    loadComponent: () =>
      import('./features/mini-games/memory/memory.component').then(
        (c) => c.MemoryComponent
      ),
  },
  {
    path: 'mini-games/type-quiz',
    loadComponent: () =>
      import('./features/mini-games/type-quiz/type-quiz.component').then(
        (c) => c.TypeQuizComponent
      ),
  },
  {
    path: 'mini-games/cry-trainer',
    loadComponent: () =>
      import('./features/mini-games/cry-trainer/cry-trainer.component').then(
        (c) => c.CryTrainerComponent
      ),
  },
  {
    path: 'mini-games/higher-lower',
    loadComponent: () =>
      import('./features/mini-games/higher-lower/higher-lower.component').then(
        (c) => c.HigherLowerComponent
      ),
  },
  {
    path: 'mini-games/stats-battle',
    loadComponent: () =>
      import('./features/mini-games/stats-battle/stats-battle.component').then(
        (c) => c.StatsBattleComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
];
