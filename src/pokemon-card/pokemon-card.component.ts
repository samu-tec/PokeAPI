import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pokemon-card',
  imports: [],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.css',
})
export class PokemonCardComponent {
  @Input() pokemon: string = '';
  @Input() imagen: string = '';
  @Output() clickName = new EventEmitter<string>();
}
