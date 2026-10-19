# ALRÍO → WordPress (plugin)

Sitio HTML en este repo + plugin **ALRÍO HTML Landing** en WordPress: una **página** muestra la landing; el resto del sitio (contador Elementor, etc.) no se toca.

## Desarrollo local

Edita `index.html`, `css/`, `js/`, `assets/`. Abre `index.html` en el navegador o usa Live Server.

## Empaquetar el plugin

```bash
python scripts/build_wp_plugin.py
```

Genera:

- `build/alrio-html-page/` — carpeta del plugin  
- `build/alrio-html-page.zip` — para subir en WordPress  

## Instalar en WordPress

1. **Plugins → Añadir → Subir plugin** → `alrio-html-page.zip` → **Activar**
2. Crea una página vacía (ej. **Web ALRÍO**, slug `web`). **No** uses Elementor en esa página.
3. **Ajustes → ALRÍO HTML** → elige esa página → **Guardar**
4. Abre `https://tudominio.com/web/` y comprueba la landing.
5. **Portada / contador:** **Ajustes → Lectura** → portada = tu página Elementor (ej. `alrio`). Al terminar el contador, redirige a `/web/`.

## Actualizar tras cambios en el repo

**Manual:** vuelve a ejecutar `build_wp_plugin.py` y sube el ZIP o reemplaza `wp-content/plugins/alrio-html-page/` por FTP.

**GitHub → WordPress (automático):** en el repo, **Settings → Secrets → Actions**:

| Secret | Ejemplo Hostinger |
|--------|-------------------|
| `WP_SFTP_HOST` | hostname FTP |
| `WP_SFTP_USER` | usuario |
| `WP_SFTP_PASSWORD` | contraseña |
| `WP_SFTP_PORT` | `65002` |
| `WP_SFTP_PROTOCOL` | `sftp` |
| `WP_SFTP_PLUGIN_PATH` | `.../public_html/wp-content/plugins/alrio-html-page/` |

Push a **`main`** (HTML, CSS, JS, assets, plugin) ejecuta el workflow **Deploy WordPress plugin**. Purga caché en Hostinger después.

## Tipografía

Incluye **Abramo** (`assets/Abramo-Regular.otf`) y **Josefin Sans** (Google). Si cambias fuentes, mantén `assets/Abramo-Regular.otf` en el repo y regenera el plugin.
