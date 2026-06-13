import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Loading spinner: an animated Pokéball rendered entirely with CSS.
 * Stateless and has no inputs; simply include `<app-loader />` while `loading` is `true`.
 */
@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent { }
