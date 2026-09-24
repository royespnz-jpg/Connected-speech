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

## Cómo funciona el audio

Para cada clip, el sitio intenta en este orden:

1. **Audio pre-generado** (`audio/*.mp3` + `audio/manifest.json`), creado una sola vez con ElevenLabs. Es gratis para
   quien visita el sitio y **no expone tu API key**. ← recomendado
2. **ElevenLabs en vivo**, con la API key guardada en *Settings* (solo en ese navegador). Se usa para oraciones del Lab y
   para lo que no esté pre-generado. Los clips quedan en caché para no gastar créditos dos veces.
3. **La voz del navegador** (Web Speech API), si no hay nada de lo anterior.

### Opción A — Generar el audio con GitHub Actions (sin instalar nada)

1. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Nombre: `ELEVENLABS_API_KEY` · Valor: tu API key de ElevenLabs
2. (Opcional) En la pestaña **Variables**: `ELEVENLABS_VOICE_A`, `ELEVENLABS_VOICE_B`, `ELEVENLABS_MODEL`
3. **Actions → Generate audio (ElevenLabs) → Run workflow**
   - Primero dejalo con **dry_run = true** para ver cuántos créditos va a usar.
   - Después corrélo con **dry_run = false**. Los mp3 se commitean solos al repo.
4. Si ya tenés GitHub Pages activado, el sitio se vuelve a publicar automáticamente.

### Opción B — Generarlo en tu computadora

```bash
cp .env.example .env          # y pegá tu ELEVENLABS_API_KEY en .env (nunca lo subas)
npm run audio:dry             # muestra cuántos créditos va a usar
npm run audio -- --modes=natural
git add audio && git commit -m "Add audio" && git push
```

Otros comandos: `npm run voices` (lista tus voces e IDs), `--limit=50` (generar de a poco), `--force` (regenerar todo
con otra voz), `--prune` (borrar clips que ya no se usan). Solo se generan los clips que faltan, así que podés
agregar ejemplos y volver a correrlo sin pagar dos veces.

### Créditos estimados

| Modos | Clips | Créditos (Multilingual v2) | Con Flash/Turbo v2.5 |
| --- | ---: | ---: | ---: |
| `natural` | 375 | ≈ 6.300 | ≈ 3.150 |
| `slow` | 316 | ≈ 4.500 | ≈ 2.250 |
| `words` | 187 | ≈ 12.800* | ≈ 6.400* |
| todo | 878 | ≈ 23.600 | ≈ 11.800 |

\* Estimación conservadora: incluye las etiquetas `<break>` que separan las palabras. El plan gratuito de ElevenLabs
trae 10.000 créditos por mes, así que conviene empezar por `natural` y sumar `slow`/`words` después (o usar Flash).

Voces por defecto (americanas, prediseñadas): **Sarah** `EXAVITQu4vr4xnSDxMaL` (voz A) y **Brian**
`nPczCjzI2devNBz1zQrb` (voz B). Se cambian con las variables de arriba o desde *Settings* en el sitio.

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

## Estructura

```
index.html              página única (router con #/…)
css/styles.css          estilos (modo claro y oscuro)
js/content.js           los 11 temas: reglas, tablas, ejemplos, diálogos
js/exercises-data.js    los ejercicios y la corrección del dictado
js/analyzer.js          el analizador del Lab (reglas basadas en la ortografía)
js/tts.js               audio: pre-generado → ElevenLabs en vivo → voz del navegador
js/audio-core.js        parámetros de ElevenLabs compartidos por el sitio y el script
js/audio-items.js       lista de todos los clips que usa el sitio
js/views/*.js           páginas: inicio, tema, práctica, lab, settings
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
