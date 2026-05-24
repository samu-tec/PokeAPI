import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PokemonDetail, PokemonService } from '../../core/services/pokemon.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';

/**
 * Vista de detalle de un Pokémon individual.
 *
 * Recibe el identificador desde el param de ruta `pokemonId` (`/pokemon/:pokemonId`),
 * pide el detalle al {@link PokemonService} y renderiza tipos, estadísticas, habilidades
 * y datos físicos. Incluye una animación de apertura de Pokéball al cargar.
 */
@Component({
  selector: 'app-pokemon-detail',
  imports: [LoaderComponent, CapitalizePipe],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly pokemonService = inject(PokemonService);

  /** Detalle del Pokémon cargado. `undefined` mientras llega la respuesta. */
  pokemon?: PokemonDetail;

  /** ID o nombre del Pokémon leído del param de ruta. */
  readonly pokemonName: string = this.route.snapshot.params['pokemonId'];

  /** `true` mientras se está esperando la respuesta del servicio. Controla el loader. */
  loading = true;

  /** Controla la animación de apertura de la Pokéball. Se activa 600ms tras recibir los datos. */
  pokeballOpen = false;

  /**
   * Carga el detalle del Pokémon y dispara la animación de apertura tras un breve delay
   * para que el usuario perciba la transición.
   */
  ngOnInit(): void {
    this.pokemonService.getPokemonDetail(this.pokemonName).subscribe({
      next: (data) => {
        this.pokemon = data;
        this.loading = false;
        setTimeout(() => (this.pokeballOpen = true), 600);
      },
      error: () => { this.loading = false; },
    });
  }

  /**
   * Vuelve a la página anterior usando el historial del navegador.
   * Preserva el estado del listado (página, región) gracias a la integración del Router.
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Devuelve el color hex oficial de un tipo de Pokémon, o un gris neutro si no se reconoce.
   * Los colores siguen la paleta tradicional usada en juegos y merchandising.
   *
   * @param typeName Nombre del tipo en inglés/minúsculas (`"fire"`, `"water"`, …).
   */
  getTypeColor(typeName: string): string {
    const colors: Record<string, string> = {
      normal: '#A8A878', fire: '#F08030', water: '#6890F0',
      electric: '#F8D030', grass: '#78C850', ice: '#98D8D8',
      fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
      flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
      rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
      dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC',
    };
    return colors[typeName] ?? '#A8A878';
  }

  /**
   * Convierte el identificador de una estadística de la API a su etiqueta corta de UI.
   * Si la estadística no está mapeada, devuelve el identificador original.
   *
   * @example
   * getStatLabel('hp')              // 'HP'
   * getStatLabel('special-attack')  // 'Sp.ATK'
   */
  getStatLabel(statName: string): string {
    const labels: Record<string, string> = {
      hp: 'HP', attack: 'ATK', defense: 'DEF',
      'special-attack': 'Sp.ATK', 'special-defense': 'Sp.DEF', speed: 'SPD',
    };
    return labels[statName] ?? statName;
  }

  /**
   * Devuelve un color para la barra de progreso de una estadística según su valor.
   * Umbrales: <50 rojo (débil), <80 ámbar (medio), <110 verde (bueno), ≥110 azul (excelente).
   *
   * @param value Valor base de la estadística (1-255 según la API).
   */
  getStatColor(value: number): string {
    if (value < 50) return '#e53935';
    if (value < 80) return '#f9a825';
    if (value < 110) return '#43a047';
    return '#1e88e5';
  }

  /**
   * Formatea la altura de decímetros (formato de la API) a metros con un decimal.
   * @example formatHeight(7) // '0.7 m'
   */
  formatHeight(h: number): string {
    return (h / 10).toFixed(1) + ' m';
  }

  /**
   * Formatea el peso de hectogramos (formato de la API) a kilogramos con un decimal.
   * @example formatWeight(60) // '6.0 kg'
   */
  formatWeight(w: number): string {
    return (w / 10).toFixed(1) + ' kg';
  }
}
