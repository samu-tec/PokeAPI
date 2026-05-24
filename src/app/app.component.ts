import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

/**
 * Componente raíz de la aplicación.
 * Renderiza el logo cabecera y el `<router-outlet>` donde se inyectan las vistas.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);

  /** Navega a la raíz al hacer click en el logo (vuelve al listado de Pokémon). */
  onLogoClick() {
    this.router.navigate(['/']);
  }
}
