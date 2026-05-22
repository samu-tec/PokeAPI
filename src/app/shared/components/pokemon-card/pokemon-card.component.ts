import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pokemon-card',
  imports: [],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.css',
})
export class PokemonCardComponent implements OnInit {
  @Input() pokemon: string = '';
  @Input() imagen: string = '';
  @Output() clickName = new EventEmitter<string>();

  isFlipped = false;
  isTouchDevice = false;

  ngOnInit(): void {
    this.isTouchDevice = window.matchMedia('(hover: none)').matches;
  }

  onCardClick(): void {
    if (this.isTouchDevice) {
      this.isFlipped = !this.isFlipped;
    }
  }
}
