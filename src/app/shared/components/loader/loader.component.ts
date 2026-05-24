import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Spinner de carga: una Pokéball animada renderizada íntegramente con CSS.
 * Sin estado ni inputs; basta con incluir `<app-loader />` mientras `loading` sea `true`.
 */
@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent { }
