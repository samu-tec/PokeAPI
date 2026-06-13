import { Component, DestroyRef, HostListener, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PokemonCardComponent } from '../../shared/components/pokemon-card/pokemon-card.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { PokemonListItem, PokemonService, REGIONS, Region, PokemonDetail } from '../../core/services/pokemon.service';
import { TeamBuilderService } from '../../core/services/team-builder.service';

/** How many Pokémon to load per infinite-scroll batch in "All" mode. */
const INFINITE_BATCH = 40;

@Component({
  selector: 'app-pokemon-list',
  imports: [PokemonCardComponent, LoaderComponent, CapitalizePipe],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
})
export class PokemonListComponent implements OnInit, OnDestroy {
  private readonly pokemonService = inject(PokemonService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly teamService = inject(TeamBuilderService);

  /** Full list of Pokémon loaded for the current region/type combination. */
  readonly pokemons = signal<PokemonListItem[]>([]);

  /** Controls the global loader spinner. */
  readonly loading = signal<boolean>(true);

  /** Currently selected region. Defaults to `REGIONS[0]` (`All`). */
  readonly selectedRegion = signal<Region>(REGIONS[0]);

  /** Live search query string. */
  readonly searchQuery = signal<string>('');

  /** Set of selected elemental types (multi-select). */
  readonly selectedTypes = signal<string[]>([]);

  /** Union of Pokémon names that belong to ANY of the selected types. */
  readonly pokemonNamesOfTypes = signal<string[]>([]);

  /** Pokémon selected for stat comparison (max 2). */
  readonly compareList = signal<string[]>([]);

  /** Modal visibility signals. */
  readonly isTeamDrawerOpen = signal<boolean>(false);
  readonly isCompareModalOpen = signal<boolean>(false);

  /** Loaded detail data for the comparison modal. */
  readonly compareData = signal<PokemonDetail[]>([]);

  /** The 18 canonical Pokémon elemental types. */
  readonly pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  /** Immutable region catalogue for the template. */
  readonly regions = REGIONS;

  /** Controls the "scroll to top" button visibility. */
  readonly showScrollTop = signal<boolean>(false);

  // ── Infinite scroll state ──────────────────────────────────────────
  /** How many Pokémon are currently visible in infinite scroll mode. */
  readonly visibleCount = signal<number>(INFINITE_BATCH);

  /** True while loading the next batch (shows a small bottom loader). */
  readonly loadingMore = signal<boolean>(false);

  /** True when we've loaded the full list in "All" mode for infinite scroll. */
  private allPokemonLoaded = false;

  /** Full master list fetched once in "All" mode (before slicing). */
  private readonly allPokemonMaster = signal<PokemonListItem[]>([]);

  /** Candidate list of Pokémon before applying search or type filters. */
  readonly masterCandidateList = computed(() => {
    if (this.selectedRegion().name === 'All' && this.selectedTypes().length === 0) {
      const master = this.allPokemonMaster();
      if (master.length === 0) {
        return this.pokemons();
      }
      return master;
    }
    return this.pokemons();
  });

  /** Full list of filtered Pokémon (search + type filters applied) on the entire master catalog. */
  readonly allFilteredMaster = computed(() => {
    let list = this.masterCandidateList();

    // 1. Filter by selected types (intersection: Pokémon must match at least one)
    const types = this.selectedTypes();
    if (types.length > 0) {
      const allowedNames = this.pokemonNamesOfTypes();
      list = list.filter((p) => allowedNames.includes(p.name.toLowerCase()));
    }

    // 2. Filter by search text
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query));
    }

    return list;
  });

  /** Sliced filtered list of Pokémon visible in the DOM (applies infinite scroll slice). */
  readonly filteredPokemons = computed(() => {
    const list = this.allFilteredMaster();
    return list.slice(0, this.visibleCount());
  });

  /** Checks if a type is currently selected. */
  isTypeSelected(type: string): boolean {
    return this.selectedTypes().includes(type);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop.set(window.scrollY > 300);

    // Infinite scroll: load more when near the bottom
    if (!this.loadingMore() && !this.loading()) {
      const current = this.visibleCount();
      const total = this.allFilteredMaster().length;
      if (current < total) {
        const scrollPos = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 800;
        if (scrollPos >= threshold) {
          this.loadMoreInfinite();
        }
      }
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.pokemonService.listScrollPosition = 0;
    this.pokemonService.listVisibleCount = INFINITE_BATCH;
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.pokemonService.listScrollPosition = 0;
    this.pokemonService.listVisibleCount = INFINITE_BATCH;
  }

  ngOnInit(): void {
    // Restore preserved search query
    this.searchQuery.set(this.pokemonService.listSearchQuery || '');
    this.compareList.set(this.pokemonService.preservedCompareList || []);

    // Restore drawers/modals state
    if (this.pokemonService.isTeamDrawerOpen) {
      this.isTeamDrawerOpen.set(true);
      this.pokemonService.isTeamDrawerOpen = false;
    }
    if (this.pokemonService.isCompareModalOpen) {
      this.openComparison();
      this.pokemonService.isCompareModalOpen = false;
    }

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const regionParam = params['region'];
      const typeParam = params['type'];

      const targetRegionName = regionParam ? regionParam.toLowerCase() : 'all';
      const targetTypes = typeParam ? typeParam.split(/[\s+\-;,]+/).map((t: string) => t.toLowerCase().trim()).filter((t: string) => t) : [];

      const preservedRegionName = this.pokemonService.preservedRegion ? this.pokemonService.preservedRegion.name.toLowerCase() : 'all';
      const preservedTypes = this.pokemonService.preservedTypes || [];

      // Check if filters match
      const regionMatches = targetRegionName === preservedRegionName;
      const typesMatch = targetTypes.length === preservedTypes.length && targetTypes.every((t: string, i: number) => t === preservedTypes[i]);

      if (regionMatches && typesMatch && this.pokemonService.preservedPokemons.length > 0) {
        // Sync component state with preserved state synchronously
        const regionObj = REGIONS.find((r) => r.name.toLowerCase() === targetRegionName) ?? REGIONS[0];
        this.selectedRegion.set(regionObj);
        this.selectedTypes.set(preservedTypes);
        this.pokemonNamesOfTypes.set(this.pokemonService.preservedNamesOfTypes);
        this.pokemons.set(this.pokemonService.preservedPokemons);
        this.visibleCount.set(this.pokemonService.listVisibleCount || INFINITE_BATCH);
        
        if (regionObj.name === 'All' && this.pokemonService.allPokemonMasterList.length > 0) {
          this.allPokemonMaster.set(this.pokemonService.allPokemonMasterList);
          this.allPokemonLoaded = true;
        }

        this.loading.set(false);

        // Restore scroll position
        if (this.pokemonService.listScrollPosition > 0) {
          this.restoreScrollPosition(this.pokemonService.listScrollPosition);
        }
        return;
      }

      // Sync region from URL if not restoring
      if (regionParam && regionParam !== 'All') {
        const region = REGIONS.find((r) => r.name.toLowerCase() === regionParam.toLowerCase());
        this.selectedRegion.set(region ?? REGIONS[0]);
      } else {
        this.selectedRegion.set(REGIONS[0]);
      }

      // Sync types from URL (plus, space, hyphen, comma, or semicolon separated)
      if (typeParam) {
        const types = typeParam.split(/[\s+\-;,]+/).map((t: string) => t.toLowerCase().trim()).filter((t: string) => t);
        this.selectedTypes.set(types);
        this.loading.set(true);

        // Fetch Pokémon names for all selected types using cached requests
        const typeRequests = types.map((t: string) => this.pokemonService.getPokemonByType(t));
        (forkJoin(typeRequests) as import('rxjs').Observable<any[]>).subscribe({
          next: (typeDataArray) => {
            // Union of all Pokémon names across selected types
            const nameSet = new Set<string>();
            typeDataArray.forEach((typeData: any) => {
              typeData.pokemon.forEach((p: any) => {
                nameSet.add(p.pokemon.name.toLowerCase());
              });
            });
            this.pokemonNamesOfTypes.set(Array.from(nameSet));

            if (this.selectedRegion().name !== 'All') {
              this.pokemonService.getPokemonByRegion(this.selectedRegion().offset, this.selectedRegion().limit).subscribe({
                next: (regData) => {
                  this.pokemons.set(regData.results);
                  this.loading.set(false);

                  // Restore scroll position
                  if (this.pokemonService.listScrollPosition > 0) {
                    this.restoreScrollPosition(this.pokemonService.listScrollPosition);
                  }
                },
                error: () => this.loading.set(false)
              });
            } else {
              // In All mode with types, show union of all type results
              const resultMap = new Map<string, PokemonListItem>();
              typeDataArray.forEach((typeData: any) => {
                typeData.pokemon.forEach((entry: any) => {
                  const name = entry.pokemon.name.toLowerCase();
                  if (!resultMap.has(name)) {
                    resultMap.set(name, { name: entry.pokemon.name, url: entry.pokemon.url });
                  }
                });
              });
              this.pokemons.set(Array.from(resultMap.values()));
              this.loading.set(false);

              // Restore scroll position
              if (this.pokemonService.listScrollPosition > 0) {
                this.restoreScrollPosition(this.pokemonService.listScrollPosition);
              }
            }
          },
          error: () => {
            this.loading.set(false);
            alert('Error loading Pokémon by type.');
          }
        });
      } else {
        // No type filter
        this.selectedTypes.set([]);
        this.pokemonNamesOfTypes.set([]);

        if (this.selectedRegion().name !== 'All') {
          this.loadRegion(this.selectedRegion());
        } else {
          this.loadAllInfinite();
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Preserve current list state before destruction
    this.pokemonService.listScrollPosition = window.scrollY;
    this.pokemonService.listVisibleCount = this.visibleCount();
    this.pokemonService.listSearchQuery = this.searchQuery();
    
    // Save current list data and filters for instant restoration
    this.pokemonService.preservedPokemons = this.pokemons();
    this.pokemonService.preservedRegion = this.selectedRegion();
    this.pokemonService.preservedTypes = this.selectedTypes();
    this.pokemonService.preservedNamesOfTypes = this.pokemonNamesOfTypes();
    this.pokemonService.preservedCompareList = this.compareList();
    this.pokemonService.isTeamDrawerOpen = this.isTeamDrawerOpen();
    this.pokemonService.isCompareModalOpen = this.isCompareModalOpen();
  }

  // ── Infinite scroll for "All" mode ─────────────────────────────────

  /**
   * Loads the first batch (offset=0, limit=listVisibleCount) once, then
   * slices it locally for infinite scroll. Uses cached data.
   */
  private loadAllInfinite(): void {
    this.loading.set(true);
    const savedCount = this.pokemonService.listVisibleCount || INFINITE_BATCH;
    this.visibleCount.set(savedCount);
    this.allPokemonLoaded = false;

    // If already loaded in-memory in the service, restore it instantly with zero API requests
    if (this.pokemonService.allPokemonMasterList.length > 0) {
      this.allPokemonMaster.set(this.pokemonService.allPokemonMasterList);
      this.pokemons.set(this.pokemonService.allPokemonMasterList);
      this.allPokemonLoaded = true;
      this.loading.set(false);

      if (this.pokemonService.listScrollPosition > 0) {
        this.restoreScrollPosition(this.pokemonService.listScrollPosition);
      }
      return;
    }

    // Otherwise, request the first batch of savedCount to show quickly
    this.pokemonService.getPokemonByRegion(0, savedCount).subscribe({
      next: (data) => {
        this.allPokemonMaster.set(data.results);
        this.pokemons.set(data.results);
        this.loading.set(false);

        // Then request all available Pokémon in the background (cached) for future scrolling
        this.pokemonService.getPokemonByRegion(0, data.count).subscribe({
          next: (fullData) => {
            this.pokemonService.allPokemonMasterList = fullData.results;
            this.allPokemonMaster.set(fullData.results);
            this.pokemons.set(fullData.results);
            this.allPokemonLoaded = true;

            // Restore scroll position after full data loads and is rendered
            if (this.pokemonService.listScrollPosition > 0) {
              this.restoreScrollPosition(this.pokemonService.listScrollPosition);
            }
          }
        });
      },
      error: () => { this.loading.set(false); },
    });
  }

  /**
   * Appends the next batch of Pokémon when the user scrolls near the bottom.
   */
  private loadMoreInfinite(): void {
    if (!this.allPokemonLoaded) return;
    const current = this.visibleCount();
    const total = this.allFilteredMaster().length;
    if (current >= total) return;

    this.loadingMore.set(true);
    const newCount = Math.min(current + INFINITE_BATCH, total);

    // Small delay to show the mini-loader briefly
    setTimeout(() => {
      this.visibleCount.set(newCount);
      this.loadingMore.set(false);
    }, 200);
  }

  private loadRegion(region: Region): void {
    this.loading.set(true);
    this.pokemonService.getPokemonByRegion(region.offset, region.limit).subscribe({
      next: (data) => {
        this.pokemons.set(data.results);
        this.loading.set(false);

        // Restore scroll position
        if (this.pokemonService.listScrollPosition > 0) {
          this.restoreScrollPosition(this.pokemonService.listScrollPosition);
        }
      },
      error: () => { this.loading.set(false); },
    });
  }

  selectRegion(region: Region): void {
    this.pokemonService.listScrollPosition = 0;
    this.pokemonService.listVisibleCount = INFINITE_BATCH;

    const regName = region.name.toLowerCase();
    const types = this.selectedTypes();

    if (types.length > 0) {
      const typeJoined = types.join('-');
      if (regName === 'all') {
        this.router.navigate(['/pokedex', typeJoined]);
      } else {
        this.router.navigate(['/pokedex', regName, typeJoined]);
      }
    } else {
      if (regName === 'all') {
        this.router.navigate(['/pokedex']);
      } else {
        this.router.navigate(['/pokedex', regName]);
      }
    }
  }

  /**
   * Toggle a type in the multi-select list, updating URL path with hyphen-separated values.
   */
  toggleType(type: string): void {
    this.pokemonService.listScrollPosition = 0;
    this.pokemonService.listVisibleCount = INFINITE_BATCH;

    const current = this.selectedTypes();
    const lowerType = type.toLowerCase();
    let newTypes: string[];

    if (current.includes(lowerType)) {
      newTypes = current.filter((t) => t !== lowerType);
    } else {
      newTypes = [...current, lowerType];
    }

    const regName = this.selectedRegion().name.toLowerCase();
    if (newTypes.length > 0) {
      const typeJoined = newTypes.join('-');
      if (regName === 'all') {
        this.router.navigate(['/pokedex', typeJoined]);
      } else {
        this.router.navigate(['/pokedex', regName, typeJoined]);
      }
    } else {
      if (regName === 'all') {
        this.router.navigate(['/pokedex']);
      } else {
        this.router.navigate(['/pokedex', regName]);
      }
    }
  }

  toggleCompare(name: string): void {
    const list = this.compareList();
    const lowerName = name.toLowerCase();

    if (list.includes(lowerName)) {
      this.compareList.set(list.filter((n) => n !== lowerName));
    } else {
      if (list.length >= 2) {
        alert('You can only select a maximum of 2 Pokémon to compare.');
        return;
      }
      this.compareList.set([...list, lowerName]);
    }
  }

  isComparing(name: string): boolean {
    return this.compareList().includes(name.toLowerCase());
  }

  openComparison(): void {
    const list = this.compareList();
    if (list.length !== 2) {
      this.compareData.set([]);
      this.isCompareModalOpen.set(true);
      return;
    }

    this.loading.set(true);
    forkJoin([
      this.pokemonService.getPokemonDetail(list[0]),
      this.pokemonService.getPokemonDetail(list[1])
    ]).subscribe({
      next: ([p1, p2]) => {
        this.compareData.set([p1, p2]);
        this.isCompareModalOpen.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Error loading Pokémon comparison.');
      }
    });
  }

  closeComparison(): void {
    this.isCompareModalOpen.set(false);
    this.compareData.set([]);
  }

  clearCompareList(): void {
    this.compareList.set([]);
  }

  getTeamWeaknesses() {
    const members = this.teamService.team();
    if (members.length === 0) return [];

    const typeRelations: Record<string, Record<string, number>> = {
      normal: { fighting: 2, ghost: 0 },
      fire: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5 },
      water: { electric: 2, grass: 2, water: 0.5, fire: 0.5, ice: 0.5, steel: 0.5 },
      electric: { ground: 2, electric: 0.5, flying: 0.5, steel: 0.5 },
      grass: { fire: 2, ice: 2, poison: 2, flying: 2, bug: 2, water: 0.5, electric: 0.5, grass: 0.5, ground: 0.5 },
      ice: { fire: 2, fighting: 2, rock: 2, steel: 2, ice: 0.5 },
      fighting: { flying: 2, psychic: 2, fairy: 2, bug: 0.5, rock: 0.5, dark: 0.5 },
      poison: { ground: 2, psychic: 2, fighting: 0.5, poison: 0.5, bug: 0.5, grass: 0.5, fairy: 0.5 },
      ground: { water: 2, grass: 2, ice: 2, poison: 0.5, rock: 0.5, electric: 0 },
      flying: { electric: 2, ice: 2, rock: 2, grass: 0.5, fighting: 0.5, bug: 0.5, ground: 0 },
      psychic: { bug: 2, ghost: 2, dark: 2, fighting: 0.5, psychic: 0.5 },
      bug: { fire: 2, flying: 2, rock: 2, grass: 0.5, fighting: 0.5, ground: 0.5 },
      rock: { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2, normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5 },
      ghost: { ghost: 2, dark: 2, poison: 0.5, bug: 0.5, normal: 0, fighting: 0 },
      dragon: { ice: 2, dragon: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5 },
      dark: { fighting: 2, bug: 2, fairy: 2, ghost: 0.5, dark: 0.5, psychic: 0 },
      steel: { fire: 2, fighting: 2, ground: 2, normal: 0.5, grass: 0.5, ice: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, poison: 0 },
      fairy: { poison: 2, steel: 2, fighting: 0.5, bug: 0.5, dark: 0.5, dragon: 0 }
    };

    const teamWeaknessFactors: Record<string, number> = {};
    Object.keys(typeRelations).forEach((type) => {
      teamWeaknessFactors[type] = 1;
    });

    members.forEach((m) => {
      m.types.forEach((rawType) => {
        const memberType = this.getTypeName(rawType).toLowerCase();
        const relations = typeRelations[memberType] || {};
        Object.keys(relations).forEach((atkType) => {
          const factor = relations[atkType];
          teamWeaknessFactors[atkType] *= factor;
        });
      });
    });

    return Object.keys(teamWeaknessFactors)
      .map((type) => ({ type, factor: teamWeaknessFactors[type] }))
      .filter((w) => w.factor > 1.25)
      .sort((a, b) => b.factor - a.factor);
  }

  getTeamAverageStats() {
    const members = this.teamService.team();
    if (members.length === 0) return [];

    const sums: Record<string, number> = {};
    const count = members.length;

    members.forEach((m) => {
      m.stats.forEach((s) => {
        sums[s.name] = (sums[s.name] || 0) + s.value;
      });
    });

    return Object.keys(sums).map((statName) => ({
      name: statName,
      value: Math.round(sums[statName] / count)
    }));
  }

  getStatLabel(statName: string): string {
    const labels: Record<string, string> = {
      hp: 'HP', attack: 'ATK', defense: 'DEF',
      'special-attack': 'Sp.ATK', 'special-defense': 'Sp.DEF', speed: 'SPD',
    };
    return labels[statName] ?? statName;
  }

  getTypeColor(typeName: string): string {
    const name = typeName.toLowerCase().trim();
    const colors: Record<string, string> = {
      normal: '#A8A878', fire: '#F08030', water: '#6890F0',
      electric: '#F8D030', grass: '#78C850', ice: '#98D8D8',
      fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
      flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
      rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
      dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC',
    };
    return colors[name] ?? '#A8A878';
  }

  getTypeName(t: any): string {
    if (!t) return 'normal';
    if (typeof t === 'string') return t;
    if (t.type && t.type.name) return t.type.name;
    if (t.name) return t.name;
    return 'normal';
  }

  getPokemonImageUrl(url: string): string {
    const parts = url.split('/').filter((p) => p);
    const id = parts[parts.length - 1];
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  clickName(pokemon: string): void {
    this.router.navigate(['/pokedex', pokemon.toLowerCase()]);
  }

  private restoreScrollPosition(pos: number): void {
    if (pos <= 0) return;
    window.scrollTo(0, pos);
    setTimeout(() => {
      window.scrollTo(0, pos);
    }, 50);
    setTimeout(() => {
      window.scrollTo(0, pos);
    }, 150);
  }
}
