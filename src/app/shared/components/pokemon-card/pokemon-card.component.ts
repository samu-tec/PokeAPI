import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pokemon-card',
  imports: [],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss',
})
export class PokemonCardComponent implements OnInit {
  @Input() pokemon = '';
  @Input() imagen = '';
  @Output() clickName = new EventEmitter<string>();

  private readonly destroyRef = inject(DestroyRef);

  isFlipped = false;
  isTouchDevice = false;

  private flipTimer: ReturnType<typeof setTimeout> | null = null;

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
