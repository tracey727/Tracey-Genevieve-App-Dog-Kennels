> **SOURCE / RECOVERY REPOSITORY ONLY — DO NOT DEPLOY**
>
> The canonical production repository is `tracey727/Genevieve-Tracey-kennels-live-demo` on `main`. This repository is retained so earlier dog-kennel and recovery work is not lost. The recovered safety branch contains malformed HTML/encoding corruption and must not be merged wholesale into production.

# GENEVIEVE™ App — Boarding Kennels

Runnable static boarding-kennel program with the agreed GENEVIEVE™ animal colour system applied.

## Included

- `index.html`
- `styles.css`
- `app.js`
- `sw.js`
- `manifest.webmanifest`
- `vercel.json`
- `netlify.toml`
- `_redirects`
- `GENEVIEVE_ANIMAL_COLOUR_SYSTEM.md`

## Deployment

Static only.

Vercel:
- Framework Preset: Other
- Build Command: leave blank
- Install Command: leave blank
- Output Directory: leave blank or `.`
- Root Directory: `./`

## No build disputes

- no package.json
- no package-lock.json
- no node_modules
- no dist
