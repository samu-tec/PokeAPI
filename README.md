# PokeAPI Explorer

## Probando Angular en clase con la empresa Coderty

Este proyecto comenzó originalmente como una práctica de clase para aprender Angular en colaboración con la empresa **Coderty**, y posteriormente ha sido expandido con funcionalidades avanzadas y minijuegos interactivos.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=reactivex&logoColor=white)](https://rxjs.dev)
[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github)](https://samu-tec.github.io/PokeAPI)

Aplicación Angular moderna para explorar la Pokédex completa y jugar minijuegos interactivos usando la [PokéAPI](https://pokeapi.co/).

> 🔗 **Demo en vivo:** [samu-tec.github.io/PokeAPI](https://samu-tec.github.io/PokeAPI)

---

## Índice

- [Funcionalidades principales](#funcionalidades-principales)
- [Minijuegos incluidos](#minijuegos-incluidos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo ejecutar localmente](#cómo-ejecutar-localmente)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)
- [Stack tecnológico](#stack-tecnológico)
- [Créditos](#créditos)
- [Licencia](#licencia)

---

## Funcionalidades principales

- 🗺️ **Filtrado por región** — Explora Pokémon por generaciones: Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar y Paldea.
- ⚡ **Filtro Avanzado Multitipo** — Selecciona uno o varios tipos elementales en paralelo para filtrar el catálogo completo (con sincronización en la URL).
- 📋 **Tarjetas de Detalle e Historia Evolutiva** — Ficha completa con habilidades, tipo, peso/altura y la línea evolutiva completa con enlaces directos para navegar entre ellos.
- 🎨 **Estilo Moderno e Interactivo** — Tarjetas con efecto de giro 3D en hover (y soporte de tap en dispositivos móviles).
- 💾 **Caché Eficiente** — Uso de `shareReplay(1)` en servicios para que las llamadas repetidas a la API se resuelvan instantáneamente en memoria.

---

## Minijuegos incluidos

Ubicados bajo la ruta `/mini-games`, cada juego cuenta con una interfaz adaptada a móvil y escritorio:

- 👤 **Who's That Pokémon? (Trivia)**: Adivina el Pokémon oculto detrás de la silueta oscura seleccionando entre 4 opciones.
- 🃏 **Memory Match**: Encuentra las parejas correspondientes a los 4 Pokémon en una cuadrícula persistente de 8 cartas que no se oculta al ganar.
- ⚡ **Type Quiz**: Identifica el tipo elemental primario del Pokémon en pantalla.
- 🔊 **Cry Trainer**: Escucha el grito del Pokémon y adivina a quién pertenece.
- ⚖️ **Higher or Lower**: Compara el peso de dos Pokémon y adivina si el segundo es más pesado o ligero. Los botones de decisión permanecen visibles y deshabilitados después de responder.
- ⚔️ **Stats Battle**: Busca y selecciona cualquier Pokémon de Kanto como tu luchador, elige su mejor estadística (HP, ATK, DEF, SPD) y enfréntate en un duelo contra la carta oculta de la Inteligencia Artificial.

---

## Estructura del proyecto

El código sigue una arquitectura limpia orientada a componentes modulares e inyección de dependencias en Angular:

```
src/app/
├── core/
│   └── services/
│       ├── pokemon.service.ts          # Gestión HTTP, Caché y persistencia de scroll
│       ├── mini-games.service.ts       # Puntuación global y racha de aciertos
│       └── team-builder.service.ts     # Lógica del equipo de 6 y localStorage
├── features/
│   ├── pokemon-list/                   # Lista principal, filtros por tipo/región y comparador
│   ├── pokemon-detail/                 # Ficha de detalle, evolución y sonido
│   └── mini-games/                     # Módulo de minijuegos
│       ├── dashboard/                  # Panel de selección de juegos
│       ├── cry-trainer/                # Minijuego de gritos
│       ├── higher-lower/               # Minijuego de pesos (mayor/menor)
│       ├── memory/                     # Juego de encontrar parejas
│       ├── stats-battle/               # Duelo de estadísticas vs IA (con buscador de luchador)
│       ├── trivia/                     # Adivinar siluetas de Pokémon
│       └── type-quiz/                  # Adivinar tipo de Pokémon
├── shared/
│   ├── components/
│   │   ├── pokemon-card/               # Tarjeta giratoria 3D interactiva
│   │   └── loader/                     # Spinner de Pokéball animada en CSS puro
│   └── pipes/
│       └── capitalize.pipe.ts          # Limpia guiones y capitaliza textos
├── not-found/                          # Vista para error 404 (Not Found)
├── app.component.html                  # Plantilla raíz con el logo y el menú
├── app.component.ts                    # Componente raíz y control del menú de navegación
├── app.config.ts                       # Configuración de proveedores globales
└── app.routes.ts                       # Definición de rutas y lazy loading
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
| `npm run build` | Compila la aplicación en la carpeta `dist/poke-api/` optimizada para producción. |
| `npm run watch` | Compilación continua en modo desarrollo (recompila al detectar cambios). |
| `npm test` | Ejecuta las pruebas unitarias con Karma + Jasmine. |
| `npm run ng -- <comando>` | Permite ejecutar cualquier comando directamente a través del Angular CLI. |

---

## Despliegue

El despliegue a [GitHub Pages](https://samu-tec.github.io/PokeAPI) está automatizado mediante GitHub Actions. El flujo de trabajo [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) se ejecuta con cada push a la rama `main` y realiza los siguientes pasos:

1. Instala las dependencias del proyecto con `npm ci`.
2. Compila la aplicación de producción usando `npm run build -- --base-href /PokeAPI/`.
3. Duplica `index.html` a `404.html` para dar soporte a las rutas internas en el hosting estático de Pages.
4. Despliega los archivos automáticamente a la rama de hosting.

---

## Stack tecnológico

- **Angular**: v21.x (Standalone Components, Signals, Computed properties, DestroyRef).
- **TypeScript**: v5.9.x
- **RxJS**: v7.8.x
- **Zone.js**: v0.15.x
- **PokéAPI**: v2
- **Node.js (Entorno)**: v22.x

---

## Créditos

* Los datos, descripciones oficiales y sprites son obtenidos directamente de la fantástica iniciativa comunitaria [**PokéAPI**](https://pokeapi.co/).
* Pokémon y todas las marcas e ilustraciones relacionadas son marcas registradas de Nintendo, Game Freak y The Pokémon Company. Esta aplicación se ha desarrollado con fines educativos y de aprendizaje escolar sin ánimo de lucro.

---

## Licencia

Este proyecto está bajo la licencia **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)**. Puedes consultar las condiciones de uso detalladas en el archivo [LICENSE](./LICENSE).

* **Permitido**: Visualizar el código de forma educativa y compartirlo referenciando al autor original.
* **Prohibido**: Distribuir versiones derivadas o realizar modificaciones públicas del proyecto, así como cualquier uso comercial de este material.

---
Copyright © 2026 [Samuel](https://github.com/samu-tec). — Versión 3.0.0
