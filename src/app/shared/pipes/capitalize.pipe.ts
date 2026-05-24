import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que pone en mayúscula la primera letra del texto, dejando el resto intacto.
 * Útil para nombres de Pokémon, que vienen en minúsculas desde la API.
 */
@Pipe({ name: 'capitalize', standalone: true })
export class CapitalizePipe implements PipeTransform {
  /**
   * @param value Texto de entrada. Si es `null`, `undefined` o vacío, devuelve cadena vacía.
   * @returns El texto con la primera letra en mayúscula.
   *
   * @example
   * {{ 'pikachu' | capitalize }}  <!-- 'Pikachu' -->
   * {{ null | capitalize }}       <!-- '' -->
   */
  transform(value: string | null): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
