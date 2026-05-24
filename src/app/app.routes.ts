import { Routes } from '@angular/router';

/**
 * Mapa de rutas de la aplicación.
 *
 * Todas las vistas se cargan con `loadComponent` (lazy loading), de modo que cada feature
 * va en un chunk independiente que solo se descarga cuando se visita por primera vez.
 *
 * - `''`              → redirige a `/pokemons`
 * - `pokemons`        → listado con filtros y paginación
 * - `pokemon/:id`     → detalle de un Pokémon individual (id numérico o nombre)
 * - `**`              → página 404 para cualquier ruta no reconocida
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pokemons',
  },
  {
    path: 'pokemons',
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list.component').then(
        (c) => c.PokemonListComponent
      ),
  },
  {
    path: 'pokemon/:pokemonId',
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-detail.component').then(
        (c) => c.PokemonDetailComponent
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
