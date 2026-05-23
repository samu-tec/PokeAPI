import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

export interface PokemonAbility {
  ability: { name: string };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  sprites: {
    front_default: string;
    other: { 'official-artwork': { front_default: string } };
  };
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  types: { type: { name: string } }[];
}

export interface Region {
  name: string;
  offset: number;
  limit: number;
}

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
const PAGE_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly detailCache = new Map<string, Observable<PokemonDetail>>();
  private readonly regionCache = new Map<string, Observable<PokemonListResponse>>();

  getPage(offset: number): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${API}/pokemon?offset=${offset}&limit=${PAGE_SIZE}`);
  }

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
}
