import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pokemon-list',
    },
    {
        path: 'pokemon-list',
        loadComponent: () =>
            import('../pokemon-list/pokemon-list.component').then(
                (c) => c.PokemonListComponent,
            ),
    },
    { // El doble asterisco (**) es un comodín que coincide con cualquier URL que no coincida con las rutas definidas anteriormente.
        path: '**',
        loadComponent: () =>
            import('../not-found/not-found.component').then(
                (c) => c.NotFoundComponent,
            ),
    }
];
