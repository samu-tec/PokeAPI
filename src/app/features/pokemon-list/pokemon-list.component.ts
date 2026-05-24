import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonCardComponent } from '../../shared/components/pokemon-card/pokemon-card.component';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { PokemonListItem, PokemonService, REGIONS, Region } from '../../core/services/pokemon.service';

/**
 * Vista principal del listado de Pokémon.
 *
 * Tiene dos modos de operación que se determinan a partir del query param `region`:
 *
 * - **Modo paginación global (`All`)**: muestra 20 Pokémon por página y permite navegar con
 *   los botones del paginador. El offset se sincroniza con la URL (`?offset=20`).
 * - **Modo región** (`Kanto`, `Johto`, …): carga de golpe toda la generación seleccionada
 *   y oculta el paginador. La región se refleja en la URL (`?region=kanto`).
 *
 * El componente también gestiona el botón "subir arriba" que aparece tras hacer scroll.
 */
@Component({
  selector: 'app-pokemon-list',
  imports: [PokemonCardComponent, PaginatorComponent, LoaderComponent, CapitalizePipe],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
})
export class PokemonListComponent implements OnInit {
  /** Pokémon visibles actualmente (página o región). */
  pokemons: PokemonListItem[] = [];

  /** URLs de paginación devueltas por la PokéAPI. `undefined` mientras carga; en modo región ambos son `null`. */
  pages?: { next: string | null; previous: string | null };

  /** `true` mientras se está esperando la respuesta del servicio. Controla el loader. */
  loading = true;

  /** Región seleccionada en la UI. Por defecto `REGIONS[0]` (`All`). */
  selectedRegion: Region = REGIONS[0];

  /** Referencia inmutable al catálogo de regiones para el template. */
  readonly regions = REGIONS;

  /** Controla la visibilidad del botón "subir arriba". Se activa al pasar 300px de scroll. */
  showScrollTop = false;

  private readonly pokemonService = inject(PokemonService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  /** Listener global de scroll para mostrar/ocultar el botón "subir arriba". */
  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
  }

  /** Anima el scroll hasta el inicio de la página. */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** `true` cuando la región activa es la pseudo-región `All` (modo paginación global). */
  get isAllMode(): boolean {
    return this.selectedRegion.name === 'All';
  }

  /**
   * Restaura el estado a partir de los query params de la URL.
   *
   * - Si la URL trae `region`, intenta resolverla en {@link REGIONS} y carga la región entera.
   * - Si no, cae al modo paginación global y carga la página indicada por `offset` (default 0).
   *
   * La suscripción se desconecta automáticamente al destruir el componente vía {@link takeUntilDestroyed}.
   */
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

  /**
   * Cambia la región activa actualizando los query params de la URL.
   * `ngOnInit` reaccionará al cambio y disparará la carga correspondiente.
   *
   * @param region Región seleccionada por el usuario en la UI.
   */
  selectRegion(region: Region): void {
    if (region.name === 'All') {
      this.router.navigate(['/pokemons'], { queryParams: {} });
    } else {
      this.router.navigate(['/pokemons'], { queryParams: { region: region.name.toLowerCase() } });
    }
  }

  /**
   * Navega al detalle de un Pokémon.
   * @param pokemon Nombre del Pokémon (se normaliza a minúsculas para mantener URLs limpias).
   */
  clickName(pokemon: string): void {
    this.router.navigate(['/pokemon', pokemon.toLowerCase()]);
  }

  /**
   * Avanza a la siguiente página en modo paginación global.
   * Extrae el `offset` del enlace `next` devuelto por la API y lo escribe en la URL.
   */
  nextPage(): void {
    if (this.pages?.next) {
      const offset = this.parseOffset(this.pages.next);
      this.router.navigate(['/pokemons'], { queryParams: { offset } });
    }
  }

  /**
   * Retrocede a la página anterior. Si el offset resultante es 0, lo omite de la URL
   * para mantenerla limpia (`/pokemons` en lugar de `/pokemons?offset=0`).
   */
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
