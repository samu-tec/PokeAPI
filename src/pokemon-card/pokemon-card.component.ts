// import { LowerCasePipe, UpperCasePipe } from '@angular/common';
import { /* ChangeDetectionStrategy, */ Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pokemon-card',
  imports: [/* LowerCasePipe, UpperCasePipe */],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCardComponent {
  // pokemon = "Pikachu";
  @Input() pokemon: string = '';
  @Input() imagen: string = '';
  // @Input() habilities: string[] = [];
  @Output() clickName = new EventEmitter<string>();
}
