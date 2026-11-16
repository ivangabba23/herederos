# HEREDEROS · sitio web

Sitio oficial del corto **HEREDEROS / HEIRS**. En 2778 una inteligencia artificial, D.I.O.S., decide todo y las condenas se heredan con intereses.

Es un sitio estático: HTML, CSS y JavaScript sin dependencias ni paso de build.

## Estructura

```
index.html          Página principal (una sola página con secciones)
css/style.css       Estilos y tokens de la identidad visual
js/main.js          Contador en vivo, terminal de D.I.O.S., curva de la deuda, Sonido y Modo Silencio
js/audit.js         Auditoría de Sangre: el test interactivo del árbol genealógico
assets/img/         Fotogramas del corto (webp), póster y og:image
assets/video/       Teaser en loop (hero) y el corto narrado en inglés (2:01)
```

## Ver en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicar

- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.
- **Vercel o Netlify:** importar el repo; no hace falta comando de build y el directorio de salida es la raíz.

`assets/video/heirs_en.mp4` pesa unos 27 MB y entra en el límite de GitHub (100 MB por archivo). Si en el futuro se suben versiones más pesadas, conviene alojarlas en Vimeo, Mux o Cloudflare Stream y reemplazar el `src` del reproductor.

## Canon

La fórmula de la deuda es `CONDENA(año) = CONDENA ORIGINAL × 1,00948^(año − año de la falta)`: dos meses en 1726 dan 3.412 años en 2778. Las reglas completas del universo están en la biblia (`HEREDEROS_Biblia_del_Universo.pdf`).
