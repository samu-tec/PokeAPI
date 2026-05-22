import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class PokemonServiceService {
  private http = inject(HttpClient);

  getPokemonList(): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>('https://pokeapi.co/api/v2/pokemon');
  }

  changePage(url: string): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(url);
  }

  getPokemonDetail(pokemonId: string): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  }
}
