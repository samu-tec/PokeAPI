import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { TeamBuilderService } from '../../../core/services/team-builder.service';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';

/**
 * Pokémon card component featuring 3D hover/tap flip effects, team builder shortcuts, and comparisons.
 *
 * On desktop (hover-capable devices), card flipping is CSS-driven via mouse hover.
 * On mobile/tablet (touch devices), flipping is toggled via tap.
 */
@Component({
  selector: 'app-pokemon-card',
  imports: [CapitalizePipe],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss',
})
export class PokemonCardComponent implements OnInit {
  /** Name of the Pokémon displayed on this card. */
  @Input() pokemon = '';

  /** URL of the Pokémon's official artwork image. */
  @Input() imagen = '';

  /** Boolean state specifying if this card is currently selected for stat comparison. */
  @Input() isComparing = false;

  /** Emitted when clicking on the Pokémon's name, bubbling it up to the parent list component. */
  @Output() clickName = new EventEmitter<string>();

  /** Emitted when clicking on the compare selection trigger. */
  @Output() compare = new EventEmitter<string>();

  private readonly destroyRef = inject(DestroyRef);
  readonly teamService = inject(TeamBuilderService);

  /** Tracks card flip state on mobile devices. */
  isFlipped = false;

  /** True if the device doesn't support hover interactions (touchscreens). */
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

  isInTeam(): boolean {
    return this.teamService.isInTeam(this.pokemon);
  }

  toggleTeam(): void {
    this.teamService.toggleTeamMember(this.pokemon);
  }
}
