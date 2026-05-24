import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

/**
 * Item resumido devuelto por los endpoints de listado de la PokéAPI.
 * Contiene únicamente el nombre y la URL de detalle del Pokémon.
 */
export interface PokemonListItem {
  /** Nombre del Pokémon en minúsculas (ej. `"pikachu"`). */
  name: string;
  /** URL absoluta al endpoint de detalle (ej. `https://pokeapi.co/api/v2/pokemon/25/`). */
  url: string;
}

/**
 * Respuesta paginada del endpoint `/pokemon` de la PokéAPI.
 */
export interface PokemonListResponse {
  /** Total de Pokémon existentes en la API. */
  count: number;
  /** URL absoluta a la siguiente página, o `null` si es la última. */
  next: string | null;
  /** URL absoluta a la página anterior, o `null` si es la primera. */
  previous: string | null;
  /** Pokémon contenidos en la página actual. */
  results: PokemonListItem[];
}

/**
 * Estadística base individual (HP, ataque, defensa, etc.).
 */
export interface PokemonStat {
  /** Valor numérico base de la estadística (rango típico 1-255). */
  base_stat: number;
  /** Metadatos de la estadística; `stat.name` es el identificador (ej. `"speed"`). */
  stat: { name: string };
}

/**
 * Habilidad de un Pokémon.
 */
export interface PokemonAbility {
  /** Metadatos de la habilidad; `ability.name` es el identificador en kebab-case. */
  ability: { name: string };
}

/**
 * Detalle completo de un Pokémon devuelto por `/pokemon/{id-o-nombre}`.
 * Solo se tipan los campos que la app realmente consume.
 */
export interface PokemonDetail {
  /** ID numérico nacional del Pokémon. */
  id: number;
  /** Nombre del Pokémon en minúsculas. */
  name: string;
  /** Altura en decímetros (la app la convierte a metros con {@link PokemonDetailComponent.formatHeight}). */
  height: number;
  /** Peso en hectogramos (la app lo convierte a kilogramos con {@link PokemonDetailComponent.formatWeight}). */
  weight: number;
  /** Experiencia base; puede ser `null` para Pokémon sin valor asignado. */
  base_experience: number | null;
  /** Sprites disponibles; la app prioriza el artwork oficial sobre el sprite por defecto. */
  sprites: {
    front_default: string;
    other: { 'official-artwork': { front_default: string } };
  };
  /** Estadísticas base del Pokémon. */
  stats: PokemonStat[];
  /** Habilidades del Pokémon. */
  abilities: PokemonAbility[];
  /** Tipos del Pokémon (uno o dos elementos). */
  types: { type: { name: string } }[];
}

/**
 * Rango de IDs de una generación/región de Pokémon.
 * Define el slice del catálogo nacional que pertenece a esa región.
 */
export interface Region {
  /** Nombre legible de la región (ej. `"Kanto"`). El valor `"All"` indica modo paginado global. */
  name: string;
  /** Offset (índice base 0) del primer Pokémon de la región. */
  offset: number;
  /** Número de Pokémon que pertenecen a la región. */
  limit: number;
}

/**
 * Catálogo de regiones disponibles en el selector de la UI.
 * `All` es un caso especial que activa el modo paginado en lugar de cargar todo de golpe.
 * Los offsets/limits corresponden a las generaciones canónicas de Pokémon.
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
const PAGE_SIZE = 20;

/**
 * Cliente HTTP para la PokéAPI v2 con caché en memoria por sesión.
 *
 * Mantiene dos cachés independientes:
 * - **detailCache**: detalle individual por ID/nombre (uno por Pokémon visitado).
 * - **regionCache**: listado completo por par `offset-limit` (uno por región filtrada).
 *
 * Ambas usan `shareReplay(1)` para multicast: la respuesta se cachea tras la primera
 * suscripción y se reproduce a los siguientes suscriptores sin volver a llamar a la red.
 * La paginación global (`getPage`) no se cachea porque cada cambio de offset es una URL distinta
 * y la navegación entre páginas suele ser lineal.
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly detailCache = new Map<string, Observable<PokemonDetail>>();
  private readonly regionCache = new Map<string, Observable<PokemonListResponse>>();

  /**
   * Obtiene una página de Pokémon en modo paginación global (20 por página).
   * No se cachea: usado por el listado "All" donde el usuario navega por offsets.
   *
   * @param offset Índice del primer Pokémon de la página (múltiplo de 20).
   */
  getPage(offset: number): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${API}/pokemon?offset=${offset}&limit=${PAGE_SIZE}`);
  }

  /**
   * Obtiene el listado completo de Pokémon de una región concreta (sin paginar).
   * El resultado se cachea por par `offset-limit` para que volver a la misma región
   * no dispare otra petición.
   *
   * @param offset Offset del primer Pokémon de la región.
   * @param limit  Cantidad de Pokémon a traer.
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
   * Obtiene el detalle completo de un Pokémon por su identificador (ID numérico o nombre).
   * El resultado se cachea por identificador, evitando peticiones duplicadas al revisitar
   * el mismo Pokémon dentro de la sesión.
   *
   * @param id ID numérico (`"25"`) o nombre en minúsculas (`"pikachu"`).
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
}
