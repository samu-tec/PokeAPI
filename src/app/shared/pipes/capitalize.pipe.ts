import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that capitalizes each segment of a hyphen-separated text, joining them with a space.
 * Useful for Pokémon names and abilities that are received in lowercase and hyphenated from the API.
 */
@Pipe({ name: 'capitalize', standalone: true })
export class CapitalizePipe implements PipeTransform {
  /**
   * Transforms lowercase hyphenated strings (e.g. 'tapu-fini') into clean capitalized names (e.g. 'Tapu Fini').
   *
   * @param value Input text string. If null, undefined, or empty, returns an empty string.
   * @returns The formatted string with capitalized parts separated by spaces.
   *
   * @example
   * {{ 'pikachu' | capitalize }}       <!-- 'Pikachu' -->
   * {{ 'tapu-fini' | capitalize }}     <!-- 'Tapu Fini' -->
   * {{ 'lightning-rod' | capitalize }}  <!-- 'Lightning Rod' -->
   */
  transform(value: string | null): string {
    if (!value) return '';
    return value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
