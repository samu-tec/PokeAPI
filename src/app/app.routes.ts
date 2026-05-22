import { Routes } from '@angular/router';

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
