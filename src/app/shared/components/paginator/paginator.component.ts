import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

/**
 * Paginador genérico con dos botones (anterior / siguiente).
 *
 * No mantiene estado propio: emite eventos al padre, que es quien decide si hay
 * páginas disponibles y cuándo deshabilitar los botones (vía `[disabled]` en el template).
 */
@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  /** Se emite al pulsar el botón "siguiente". */
  @Output() nextPage = new EventEmitter<void>();

  /** Se emite al pulsar el botón "anterior". */
  @Output() prevPage = new EventEmitter<void>();
}
