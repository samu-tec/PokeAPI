import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

/**
 * Tarjeta de Pokémon con efecto de giro 3D.
 *
 * En dispositivos con hover (escritorio) el giro se controla con CSS al pasar el ratón.
 * En dispositivos táctiles —detectados con `matchMedia('(hover: none)')`— el giro se
 * controla con tap y se revierte automáticamente a los 3 segundos para evitar que la
 * tarjeta quede volteada al hacer scroll.
 */
@Component({
  selector: 'app-pokemon-card',
  imports: [],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss',
})
export class PokemonCardComponent implements OnInit {
  /** Nombre del Pokémon que muestra la tarjeta. */
  @Input() pokemon = '';

  /** URL del sprite/artwork del Pokémon. */
  @Input() imagen = '';

  /** Se emite al hacer click en el nombre, propagando el nombre del Pokémon hacia el padre. */
  @Output() clickName = new EventEmitter<string>();

  private readonly destroyRef = inject(DestroyRef);

  /** Estado actual del giro de la tarjeta (solo aplicable en táctil). */
  isFlipped = false;

  /** `true` si el dispositivo no soporta hover (móvil/tablet). Determina el modo de interacción. */
  isTouchDevice = false;

  private flipTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Suscribe un listener a `matchMedia('(hover: none)')` para actualizar {@link isTouchDevice}
   * dinámicamente (ej. conectar un ratón a una tablet). Limpia el listener y cualquier
   * timer pendiente al destruir el componente.
   */
  ngOnInit(): void {
    const mql = window.matchMedia('(hover: none)');
    this.isTouchDevice = mql.matches;
    const handler = ({ matches }: MediaQueryListEvent) => {
      this.isTouchDevice = matches;
    };
    mql.addEventListener('change', handler);
    this.destroyRef.onDestroy(() => {
      mql.removeEventListener('change', handler);
      if (this.flipTimer) clearTimeout(this.flipTimer);
    });
  }

  /**
   * Alterna el giro de la tarjeta. Solo actúa en dispositivos táctiles; en escritorio
   * el CSS gestiona el hover. Tras voltearse, programa un auto-flip a los 3 s.
   */
  onCardClick(): void {
    if (!this.isTouchDevice) return;
    if (this.flipTimer) clearTimeout(this.flipTimer);
    this.isFlipped = !this.isFlipped;
    if (this.isFlipped) {
      this.flipTimer = setTimeout(() => {
        this.isFlipped = false;
        this.flipTimer = null;
      }, 3000);
    }
  }
}
