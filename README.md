# Connected Speech Lab

Sitio web interactivo para estudiar **connected speech / sandhi** del inglés norteamericano, con audio natural
generado con **ElevenLabs**. Está basado en dos lecturas:

- Celce-Murcia et al., *Teaching Pronunciation* — Cap. 5 “Connected Speech, Stress, and Rhythm”
- Prator & Robinett, *Manual of American English Pronunciation* — Lección 16 “The Sandhi of Spoken English”

> Los PDF originales **no** están incluidos en el repositorio (tienen derechos de autor). El contenido del sitio es
> un resumen propio con los ejemplos de las lecturas.

## Qué incluye

| Sección | Contenido |
| --- | --- |
| **11 temas** | Contracciones y blends · Linking (los 5 contextos) · Asimilación (progresiva, regresiva, coalescente) · Palatalización · Deleción (síncopa, aféresis, /r/ que desaparece…) · Epéntesis y disimilación · Weak forms y consonantes silábicas · Las distintas *t* (flap, *t* que desaparece, twenty…ninety) · gonna/gotta/hasta/hafta/oughta/usta/wanna · Qué usar, qué reconocer y qué evitar · Ideas para enseñar (diálogo, knock-knock jokes, picture grid…) |
| **316 ejemplos + 5 diálogos con audio** | Cada ejemplo tiene ▶ *Play* (conectado), *Slow* y *Word by word* (palabra por palabra, la versión “choppy”) para comparar, más **Record** para grabarte y comparar con el modelo |
| **9 sets de ejercicios** | Nombrar el proceso · gonna vs. going to (Ej. F) · qué sonido palatalizado (Ej. G) · las *t* de twenty…ninety (Ej. I) · deleción de /t d/ · weak vs. strong forms · usar/reconocer/evitar · encontrar las palabras con síncopa (Ej. H) · dictado a velocidad real |
| **Connected Speech Lab** | Escribís cualquier oración y marca linking, glides, palatalización, asimilación, deleción, flaps, reducciones (gonna, wanna…) y weak forms; después la escuchás y te grabás |

Los diálogos (Bob y Marie, knock-knock jokes) usan **dos voces** distintas.

## Voces de ElevenLabs (motor de voz)

El audio se genera **en vivo desde la página** a través de tu Google Apps Script
([`google-apps-script/Code.gs`](google-apps-script/Code.gs)): la API key de ElevenLabs queda guardada en el script,
nunca en la página ni en el repo. Cada frase generada se guarda en una carpeta de tu Drive
(*Connected Speech Lab — Audio de ElevenLabs*), así que la misma frase no se vuelve a pagar.

- **Elegir voces:** tocá el botón de voz arriba a la derecha (● ElevenLabs · Sarah). Ahí elegís ElevenLabs o la voz del
  navegador, la **voz principal** y la **segunda voz** (la de los diálogos), con vista previa gratis de cada voz. Por
  defecto muestra solo voces americanas.
- **Límite diario:** para que nadie te gaste los créditos, el script corta a los 20.000 caracteres *nuevos* por día
  (lo repetido no cuenta). Se cambia con la propiedad `ELEVENLABS_DAILY_LIMIT` del script.
- **Modelo:** en *Settings* (Multilingual v2 por defecto; Flash/Turbo cuestan la mitad).
- Si el script no responde, la página usa la voz del navegador y lo avisa.

La URL del script ya está configurada en [`js/config.js`](js/config.js).

<details><summary>Opcional: generar mp3 estáticos en vez de usar el script</summary>

`npm run audio` (con `ELEVENLABS_API_KEY` en `.env`) o la Action *Generate audio (ElevenLabs)* generan los clips y los
guardan en `audio/`. La página los usa si coinciden con la voz elegida. No hace falta para que todo funcione.
</details>

## Resultados en Google Sheets (para docentes)

Cuando un alumno termina un ejercicio, la app puede mandar el resultado a una planilla de Google tuya. El código está en
[`google-apps-script/Code.gs`](google-apps-script/Code.gs) y crea estas hojas:

| Hoja | Qué guarda |
| --- | --- |
| **Resumen** | Promedio, mejor nota, intentos y última vez de cada alumno; promedio de cada ejercicio (se actualiza solo) |
| **Resultados** | Una fila por ejercicio terminado: fecha, alumno, curso, ejercicio, correctas, total, %, duración |
| **Respuestas** | Una fila por pregunta: qué contestó el alumno, cuál era la correcta y ✓/✗ (las incorrectas en rojo) |
| **Grabaciones** | Las grabaciones que el alumno elige enviar (“Send to my teacher”), con un link ▶ al audio en tu Drive |
| **Alumno × Ejercicio** | La mejor nota de cada alumno en cada ejercicio, en forma de tabla |

**Instalación (una sola vez)** — si ya lo tenías instalado, pegá el `Code.gs` nuevo, ejecutá `setup` de nuevo (pide un
permiso más, para conectarse a ElevenLabs) y hacé *Implementar → Administrar implementaciones → ✏ → Nueva versión*:

1. Creá una planilla nueva (<https://sheets.new>) → **Extensiones → Apps Script**.
2. Borrá lo que haya, pegá todo `Code.gs` y guardá.
3. Elegí la función **`setup`** → **▶ Ejecutar** → aceptá los permisos (si dice “Google no verificó esta app”:
   *Configuración avanzada → Ir a…*; es tu propio script).
4. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: **Yo** · Quién tiene acceso:
   **Cualquier persona** → copiá la URL que termina en `/exec`.
5. En la app: **Settings → Results → Google Sheets** → pegá la URL → *Test connection* → *Save*.
6. En la planilla: menú **Connected Speech → Guardar API key de ElevenLabs** y pegá tu key (o en Apps Script:
   ⚙ Configuración del proyecto → Propiedades del script → `ELEVENLABS_API_KEY`). *Estado de ElevenLabs* muestra el uso.
7. Copiá el **Student link** que aparece en Settings y compartilo: abre los ejercicios ya conectados a tu planilla. La
   primera vez que el alumno termina un ejercicio le pide nombre y curso.

Detalles: si no hay conexión, el resultado queda guardado en el navegador y se reenvía después (la planilla ignora
duplicados). Los textos que parecen fórmulas se guardan como texto. Si cambiás `Code.gs`, volvé a implementar con
*Administrar implementaciones → ✏ → Nueva versión* (la URL no cambia). En cuentas de escuela (Google Workspace) el
administrador puede no permitir “Cualquier persona”; en ese caso usá una cuenta personal.

## Publicarlo (GitHub Pages)

1. Mergeá esta rama a `main`.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. El workflow *Deploy to GitHub Pages* publica el sitio en cada push a `main` (y después de generar audio).

## Usarlo localmente

```bash
npm start        # http://localhost:8080
npm test         # tests del analizador, del contenido y de los ejercicios
```

No hay dependencias ni build: es HTML, CSS y JavaScript (módulos ES). Hace falta Node 20+ solo para los scripts.

## Diseño

Estilo “editorial acústico”: papel cálido con grano (o estudio nocturno en modo oscuro), tinta y un acento bermellón. El
arco de enlace ‿ es la firma visual: se dibuja entre las palabras y late mientras suena el audio. Tipografías: Instrument
Serif (títulos y ejemplos), Onest (texto), Gentium Book Plus (IPA) e IBM Plex Mono (etiquetas). Transiciones entre
páginas con la View Transitions API, apariciones escalonadas al hacer scroll, ecualizador en el botón que suena, ondas en
vivo en la portada, tema claro/oscuro, y todo respeta *reducir movimiento*.

## Estructura

```
index.html              página única (router con #/…)
css/styles.css          estilos (modo claro y oscuro)
js/content.js           los 11 temas: reglas, tablas, ejemplos, diálogos
js/exercises-data.js    los ejercicios y la corrección del dictado
js/analyzer.js          el analizador del Lab (reglas basadas en la ortografía)
js/tts.js               motor de voz: clip pre-generado → ElevenLabs (script o key propia) → voz del navegador
js/voice-panel.js       el panel para elegir voces
js/script-api.js        comunicación con el Google Apps Script
js/config.js            URL del Google Apps Script
js/audio-core.js        parámetros de ElevenLabs compartidos por el sitio y el script
js/audio-items.js       lista de todos los clips que usa el sitio
js/views/*.js           páginas: inicio, tema, práctica, lab, settings
js/sheets.js            envío de resultados y grabaciones a Google Sheets
google-apps-script/Code.gs   el script de la planilla (pegar en Apps Script)
scripts/generate-audio.mjs   genera los mp3 con ElevenLabs
scripts/serve.mjs            servidor local
.github/workflows/           audio, Pages y tests
```

### Agregar ejemplos

Los ejemplos usan una mini-notación (en `js/content.js`):

| Marca | Significa | Ejemplo | Se ve | Se lee (TTS) |
| --- | --- | --- | --- | --- |
| `_` | linking | `stop_it` | stop‿it | stop it |
| `[y]` | sonido insertado | `stay_[y]up` | stay‿ʸup | stay up |
| `(t)` | no se pronuncia | `twen(t)y` | twen~~t~~y | twenty |
| `*ss*` | sonido que cambia | `mi*ss*_*y*ou` | mi**ss**‿**y**ou | miss you |

Con `say:` podés indicar otro texto para el audio. Después de agregar ejemplos, corré de nuevo `npm run audio`.

## Privacidad

La API key que escribas en *Settings* se guarda solo en tu navegador (`localStorage`) y solo se envía a
`api.elevenlabs.io`. Las grabaciones de tu voz nunca salen de tu navegador. No subas el archivo `.env`.
