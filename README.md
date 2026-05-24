# PokeAPI Explorer

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=reactivex&logoColor=white)](https://rxjs.dev)
[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github)](https://samu-tec.github.io/PokeAPI)

Aplicación Angular para explorar la Pokédex completa usando la [PokéAPI](https://pokeapi.co/).

> 🔗 **Demo en vivo:** [samu-tec.github.io/PokeAPI](https://samu-tec.github.io/PokeAPI)

> **Origen:** Este proyecto comenzó como una práctica en clase con la empresa **[Coderty](https://coderty.com)**, con el objetivo de aprender Angular trabajando con APIs reales. Desde entonces ha evolucionado con nuevas funcionalidades, mejoras de UX y una arquitectura más completa.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo ejecutar localmente](#cómo-ejecutar-localmente)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)
- [Stack tecnológico](#stack-tecnológico)
- [Créditos](#créditos)
- [Licencia](#licencia)

---

## Funcionalidades

- 🗺️ **Filtrado por región** — Explora los Pokémon de cada generación: Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar y Paldea. Los datos se cargan bajo demanda y se cachean por sesión para minimizar las peticiones a la API.
- 🔄 **Paginación con memoria** — Al volver desde el detalle de un Pokémon, la aplicación recupera exactamente la página en la que estabas. La URL refleja el estado (ej. `/pokemons?offset=20`).
- 📋 **Tarjetas de detalle mejoradas** — Cada Pokémon muestra sus tipos (con colores oficiales), estadísticas base con barras de progreso, habilidades y datos de altura/peso correctamente formateados.
- 📱 **Diseño responsive** — Adaptado para móvil y escritorio. Las tarjetas se redimensionan en pantallas pequeñas y el giro de la carta funciona con tap en dispositivos táctiles.
- ⬆️ **Botón de subir** — Aparece automáticamente al hacer scroll, especialmente útil al explorar regiones con muchos Pokémon.
- 🎨 **Tema claro** — Fondo degradado crema/azul claro en lugar del negro original, manteniendo los colores amarillo y azul de la Pokédex.
- ⚡ **Caché de peticiones** — Los detalles individuales y las listas de región se cachean con `shareReplay(1)`, evitando peticiones duplicadas a la API.
- 🧹 **URLs limpias** — Rutas en minúsculas y descriptivas (ej. `/pokemons`, `/pokemon/pikachu`).

---

## Estructura del proyecto

```
src/app/
├── core/
│   └── services/
│       └── pokemon.service.ts          # HTTP + caché + constante REGIONS
├── features/
│   ├── pokemon-list/                   # Vista principal: listado, filtros, paginación
│   └── pokemon-detail/                 # Vista de detalle: stats, tipos, habilidades
├── shared/
│   ├── components/
│   │   ├── pokemon-card/               # Tarjeta con animación de giro 3D
│   │   ├── paginator/                  # Botones de navegación de páginas
│   │   └── loader/                     # Spinner de carga (Pokéball animada)
│   └── pipes/
│       └── capitalize.pipe.ts          # Capitaliza la primera letra
├── not-found/                          # Página 404
├── app.component.ts                    # Componente raíz (logo + outlet)
├── app.config.ts                       # Providers (Router, HTTP, Animations)
└── app.routes.ts                       # Rutas (lazy loading)
```

---

## Cómo ejecutar localmente

> Requisitos: Node.js 22+ y npm 10+.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/samu-tec/PokeAPI.git
   cd PokeAPI
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Levanta el servidor de desarrollo:
   ```bash
   npm start
   ```

4. Abre [http://localhost:4200/](http://localhost:4200/) en tu navegador.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `localhost:4200` con recarga en caliente. |
| `npm run build` | Compila la aplicación a `dist/poke-api/` para producción. |
| `npm run watch` | Compilación continua en modo development (rebuild ante cambios). |
| `npm test` | Ejecuta los tests con Karma + Jasmine. |
| `npm run ng -- <comando>` | Pasa cualquier comando directamente al Angular CLI. |

---

## Despliegue

El despliegue a [GitHub Pages](https://samu-tec.github.io/PokeAPI) es **automático**. El workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) se ejecuta en cada push a `main` y:

1. Instala dependencias con `npm ci`.
2. Compila con `npm run build -- --base-href /PokeAPI/`.
3. Copia `index.html` como `404.html` (necesario para que el router de Angular funcione en GitHub Pages).
4. Sube el artefacto y despliega a Pages.

No requiere intervención manual.

---

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| Angular | 21.x |
| TypeScript | 5.9.x |
| RxJS | 7.8.x |
| Zone.js | 0.15.x |
| PokéAPI | v2 |
| Node.js (CI) | 22 |

---

## Créditos

Datos y sprites obtenidos de [**PokéAPI**](https://pokeapi.co/), un servicio gratuito y abierto mantenido por la comunidad. Por favor, respeta su [política de uso justo](https://pokeapi.co/docs/v2#fairuse) si reutilizas la API.

Pokémon y todos los nombres relacionados son marcas registradas de Nintendo, Game Freak y The Pokémon Company. Este proyecto es una aplicación de aprendizaje sin fines de lucro y no está afiliado oficialmente a ninguna de esas entidades.

---

## Licencia

Este proyecto está licenciado bajo **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)** — ver el archivo [LICENSE](./LICENSE) para el texto completo.

**Resumen** (no sustituye al texto legal):

- ✅ **Puedes** ver el código y compartirlo con atribución al autor.
- ❌ **No puedes** modificarlo ni distribuir versiones derivadas.
- ❌ **No puedes** usarlo con fines comerciales.

[![CC BY-NC-ND 4.0](https://licensebuttons.net/l/by-nc-nd/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

Copyright © 2026 [Samuel](https://github.com/samu-tec).
