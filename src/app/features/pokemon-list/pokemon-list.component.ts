import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonCardComponent } from '../../shared/components/pokemon-card/pokemon-card.component';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { PokemonListItem, PokemonService, REGIONS, Region } from '../../core/services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  imports: [PokemonCardComponent, PaginatorComponent, LoaderComponent, CapitalizePipe],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
})
export class PokemonListComponent implements OnInit {
  pokemons: PokemonListItem[] = [];
  pages?: { next: string | null; previous: string | null };
  loading = true;
  selectedRegion: Region = REGIONS[0];
  readonly regions = REGIONS;
  showScrollTop = false;

  private readonly pokemonService = inject(PokemonService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get isAllMode(): boolean {
    return this.selectedRegion.name === 'All';
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const regionName = params['region'];
      const offset = parseInt(params['offset'] ?? '0', 10);

      if (regionName && regionName !== 'All') {
        const region = REGIONS.find((r) => r.name.toLowerCase() === regionName.toLowerCase());
        this.selectedRegion = region ?? REGIONS[0];
        if (this.selectedRegion.name !== 'All') {
          this.loadRegion(this.selectedRegion);
          return;
        }
      }

      this.selectedRegion = REGIONS[0];
      this.loadPage(offset);
    });
  }

  private loadPage(offset: number): void {
    this.loading = true;
    this.pokemonService.getPage(offset).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.pokemons = data.results;
          this.pages = { next: data.next, previous: data.previous };
          this.loading = false;
        }, 350);
      },
      error: () => { this.loading = false; },
    });
  }

  private loadRegion(region: Region): void {
    this.loading = true;
    this.pokemonService.getPokemonByRegion(region.offset, region.limit).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.pokemons = data.results;
          this.pages = { next: null, previous: null };
          this.loading = false;
        }, 350);
      },
      error: () => { this.loading = false; },
    });
  }

  selectRegion(region: Region): void {
    if (region.name === 'All') {
      this.router.navigate(['/pokemons'], { queryParams: {} });
    } else {
      this.router.navigate(['/pokemons'], { queryParams: { region: region.name.toLowerCase() } });
    }
  }

  clickName(pokemon: string): void {
    this.router.navigate(['/pokemon', pokemon.toLowerCase()]);
  }

  nextPage(): void {
    if (this.pages?.next) {
      const offset = this.parseOffset(this.pages.next);
      this.router.navigate(['/pokemons'], { queryParams: { offset } });
    }
  }

  prevPage(): void {
    if (this.pages?.previous) {
      const offset = this.parseOffset(this.pages.previous);
      this.router.navigate(['/pokemons'], { queryParams: { offset: offset || undefined } });
    }
  }

  private parseOffset(url: string): number {
    try {
      return parseInt(new URL(url).searchParams.get('offset') ?? '0', 10);
    } catch {
      return 0;
    }
  }
}
