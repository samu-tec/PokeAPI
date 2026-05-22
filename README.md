# PokeAPI Explorer

Aplicación Angular para explorar la Pokédex completa usando la [PokéAPI](https://pokeapi.co/).

> **Origen:** Este proyecto comenzó como una práctica en clase con la empresa **[Coderty](https://coderty.com)**, con el objetivo de aprender Angular trabajando con APIs reales. Desde entonces ha evolucionado con nuevas funcionalidades, mejoras de UX y una arquitectura más completa.

La versión compilada para producción está disponible en GitHub Pages:  
🔗 [https://samu-tec.github.io/PokeAPI](https://samu-tec.github.io/PokeAPI)

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
│       └── pokemon.service.ts       # Servicio HTTP + caché + constante REGIONS
├── features/
│   ├── pokemon-list/                # Vista principal con listado y filtros
│   └── pokemon-detail/              # Vista de detalle de cada Pokémon
├── shared/
│   ├── components/
│   │   ├── pokemon-card/            # Tarjeta con animación de giro 3D
│   │   ├── paginator/               # Botones de navegación de páginas
│   │   └── loader/                  # Spinner de carga (Pokeball animada)
│   └── pipes/
│       └── capitalize.pipe.ts
└── not-found/                       # Página 404
```

---

## Cómo ejecutar localmente

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
ng serve
```

4. Abre `http://localhost:4200/` en tu navegador.

---

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| Angular | 19.x |
| TypeScript | 5.x |
| PokéAPI | v2 |
| RxJS | 7.x |
