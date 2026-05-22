# PokeAPI

## Probando Angular en clase con la empresa Coderty

Este proyecto es una pequeña aplicación de ejemplo hecha con Angular. Permite explorar Pokémon **usando APIs**, de las que se obtienen tanto los datos como las imágenes de cada Pokémon. Es ideal para practicar el desarrollo con **componentes, servicios y rutas** en Angular.

La versión **compilada para producción** está disponible en GitHub Pages:  
[https://samu-tec.github.io/PokeAPI](https://samu-tec.github.io/PokeAPI)

---

## Cómo ver el proyecto localmente

1. Clona este repositorio:  
```bash
git clone https://github.com/samu-tec/PokeAPI.git
```

2. Instala las dependencias:  
```bash
npm install
```

3. Levanta el servidor de desarrollo:  
```bash
ng serve
```

4. Abre tu navegador en `http://localhost:4200/`.  
El proyecto se recargará automáticamente cada vez que hagas cambios en el código.

---

## Construir para producción

Para generar la versión optimizada y lista para desplegar:

```bash
ng build --configuration production
```

Los archivos compilados se guardan en `dist/poke-api/browser/`, listos para subir a GitHub Pages u otro hosting.

---

## Despliegue en GitHub Pages

El proyecto se despliega automáticamente en GitHub Pages cada vez que haces `git push` a la rama `main`, gracias a un workflow de **GitHub Actions** (`.github/workflows/deploy.yml`). No existe rama `gh-pages` — GitHub gestiona los archivos compilados internamente.

### Primera configuración (solo una vez)

En GitHub → **Settings** → **Pages**, asegúrate de que el source es **"GitHub Actions"** (no una rama).

### ¿Cómo despliego?

```bash
git add .
git commit -m "mi cambio"
git push origin main
# GitHub Actions compila y publica automáticamente
```

La app queda disponible en: **https://samu-tec.github.io/PokeAPI**

---

¡Disfruta explorando Pokémon y practicando Angular! 🚀
