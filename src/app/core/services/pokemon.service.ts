import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

/**
 * Summarized item returned by PokéAPI list endpoints.
 * Contains only the name and absolute detail URL of the Pokémon.
 */
export interface PokemonListItem {
  /** Pokémon name in lowercase (e.g., `"pikachu"`). */
  name: string;
  /** Absolute URL to the detail endpoint (e.g., `https://pokeapi.co/api/v2/pokemon/25/`). */
  url: string;
}

/**
 * Paged response from the PokéAPI `/pokemon` endpoint.
 */
export interface PokemonListResponse {
  /** Total number of existing Pokémon in the API. */
  count: number;
  /** URL to the next page, or `null` if it is the last page. */
  next: string | null;
  /** URL to the previous page, or `null` if it is the first page. */
  previous: string | null;
  /** List of Pokémon items in the current page. */
  results: PokemonListItem[];
}

/**
 * Individual base statistic (HP, attack, defense, etc.).
 */
export interface PokemonStat {
  /** Numeric value of the base stat (typical range: 1-255). */
  base_stat: number;
  /** Stat metadata; `stat.name` is the identifier (e.g., `"speed"`). */
  stat: { name: string };
}

/**
 * Pokémon ability.
 */
export interface PokemonAbility {
  /** Ability metadata; `ability.name` is the identifier in kebab-case. */
  ability: { name: string };
}

/**
 * Full details of a Pokémon returned by `/pokemon/{id-or-name}`.
 * Only properties consumed by the application are typed.
 */
export interface PokemonDetail {
  /** National numeric ID of the Pokémon. */
  id: number;
  /** Pokémon name in lowercase. */
  name: string;
  /** Height in decimeters. */
  height: number;
  /** Weight in hectograms. */
  weight: number;
  /** Base experience; may be `null` for Pokémon without an assigned value. */
  base_experience: number | null;
  /** Available sprites; the application prioritizes official artwork over the default front sprite. */
  sprites: {
    front_default: string;
    other: { 'official-artwork': { front_default: string } };
  };
  /** Base statistics of the Pokémon. */
  stats: PokemonStat[];
  /** Pokémon abilities. */
  abilities: PokemonAbility[];
  /** Pokémon types (one or two elements). */
  types: { type: { name: string } }[];
  /** Pokémon vocalizations / sounds. */
  cries?: {
    latest: string;
    legacy: string;
  };
  /** Pokémon species info. */
  species: {
    name: string;
    url: string;
  };
}

/**
 * Range of IDs for a Pokémon generation/region.
 * Defines the slice of the national catalog belonging to that region.
 */
export interface Region {
  /** Human-readable name of the region (e.g., `"Kanto"`). `"All"` indicates global infinite scroll mode. */
  name: string;
  /** Offset (0-based index) of the first Pokémon of the region. */
  offset: number;
  /** Number of Pokémon belonging to the region. */
  limit: number;
}

/**
 * Catalog of available regions in the UI selector.
 * `All` is a special case that triggers infinite scroll.
 * Offsets and limits correspond to canonical Pokémon generations.
 */
export const REGIONS: Region[] = [
  { name: 'All',    offset: 0,   limit: 20  },
  { name: 'Kanto',  offset: 0,   limit: 151 },
  { name: 'Johto',  offset: 151, limit: 100 },
  { name: 'Hoenn',  offset: 251, limit: 135 },
  { name: 'Sinnoh', offset: 386, limit: 107 },
  { name: 'Unova',  offset: 493, limit: 156 },
  { name: 'Kalos',  offset: 649, limit: 72  },
  { name: 'Alola',  offset: 721, limit: 88  },
  { name: 'Galar',  offset: 809, limit: 96  },
  { name: 'Paldea', offset: 905, limit: 120 },
];

const API = 'https://pokeapi.co/api/v2';

/**
 * HTTP client for PokéAPI v2 with in-memory session caching.
 *
 * Maintains four caches:
 * - **detailCache**: individual details by ID/name.
 * - **regionCache**: complete list by offset-limit pairs.
 * - **speciesCache**: species data by URL.
 * - **evolutionCache**: evolution chain by URL.
 * - **typeCache**: Pokémon names by elemental type.
 *
 * All use `shareReplay(1)` for multicasting: responses are cached on the first subscription
 * and replayed to subsequent subscribers without hitting the network again.
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly detailCache = new Map<string, Observable<PokemonDetail>>();
  private readonly regionCache = new Map<string, Observable<PokemonListResponse>>();
  private readonly speciesCache = new Map<string, Observable<any>>();
  private readonly evolutionCache = new Map<string, Observable<any>>();
  private readonly typeCache = new Map<string, Observable<any>>();

  // --- State preservation variables for PokemonListComponent ---
  listScrollPosition = 0;
  listVisibleCount = 40;
  listSearchQuery = '';
  allPokemonMasterList: PokemonListItem[] = [];
  preservedPokemons: PokemonListItem[] = [];
  preservedRegion: Region | null = null;
  preservedTypes: string[] = [];
  preservedNamesOfTypes: string[] = [];
  preservedCompareList: string[] = [];
  isTeamDrawerOpen = false;
  isCompareModalOpen = false;

  /**
   * Fetches the complete list of Pokémon for a specific region (uncut).
   * Cached by offset-limit key so switching back to the same region doesn't trigger a new request.
   *
   * @param offset Offset of the first Pokémon of the region.
   * @param limit  Quantity of Pokémon to retrieve.
   */
  getPokemonByRegion(offset: number, limit: number): Observable<PokemonListResponse> {
    const key = `${offset}-${limit}`;
    let cached = this.regionCache.get(key);
    if (!cached) {
      cached = this.http
        .get<PokemonListResponse>(`${API}/pokemon?offset=${offset}&limit=${limit}`)
        .pipe(shareReplay(1));
      this.regionCache.set(key, cached);
    }
    return cached;
  }

  /**
   * Fetches full details of a Pokémon by ID or lowercase name.
   * Cached locally to avoid duplicate requests when re-visiting details.
   *
   * @param id Numeric ID (e.g. `"25"`) or lowercase name (e.g. `"pikachu"`).
   */
  getPokemonDetail(id: string): Observable<PokemonDetail> {
    let cached = this.detailCache.get(id);
    if (!cached) {
      cached = this.http
        .get<PokemonDetail>(`${API}/pokemon/${id}`)
        .pipe(shareReplay(1));
      this.detailCache.set(id, cached);
    }
    return cached;
  }

  /**
   * Fetches Pokémon species details from the given species URL.
   * Result is cached locally.
   */
  getPokemonSpecies(url: string): Observable<any> {
    let cached = this.speciesCache.get(url);
    if (!cached) {
      cached = this.http.get<any>(url).pipe(shareReplay(1));
      this.speciesCache.set(url, cached);
    }
    return cached;
  }

  /**
   * Fetches the evolution chain from the given evolution chain URL.
   * Result is cached locally.
   */
  getEvolutionChain(url: string): Observable<any> {
    let cached = this.evolutionCache.get(url);
    if (!cached) {
      cached = this.http.get<any>(url).pipe(shareReplay(1));
      this.evolutionCache.set(url, cached);
    }
    return cached;
  }

  /**
   * Fetches all Pokémon associated with a specific elemental type.
   * Result is cached locally.
   */
  getPokemonByType(typeName: string): Observable<any> {
    const lowerName = typeName.toLowerCase();
    let cached = this.typeCache.get(lowerName);
    if (!cached) {
      cached = this.http.get<any>(`${API}/type/${lowerName}`).pipe(shareReplay(1));
      this.typeCache.set(lowerName, cached);
    }
    return cached;
  }
}
