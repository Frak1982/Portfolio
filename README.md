# Portfolio di Francesco Raciti

Portfolio e CV realizzati con HTML semantico, CSS responsive e JavaScript con moduli ES. Nessun framework e nessuna dipendenza necessaria in produzione.

## Avvio locale

Con Node.js 22 o successivo e npm:

```sh
npm ci
npm start
```

Apri <http://127.0.0.1:4173>. Il server di sviluppo serve solo i file pubblici del sito. Non usare `file://`: i moduli JavaScript richiedono HTTP.

## Struttura

- `index.html`: contenuti, sezioni e template dei dettagli dei progetti.
- `css/style.css`: layout, componenti, animazioni e breakpoint.
- `js/main.js`: punto di ingresso dei moduli.
- `js/animation-state.js`: sospende gli effetti fuori schermo, nelle schede nascoste e con movimento ridotto.
- `js/scene-layout.js`: allinea gli elementi decorativi al ritaglio responsive della hero.
- `js/contact.js`: copia email e preparazione del messaggio nell'app email.
- `assets/`: CV, immagini e icone locali.
- `tests/`: verifiche del browser per risorse, responsive, dialog, movimento ridotto e sito senza JavaScript.

## Modifiche e controlli

```sh
npm run format
npm run format:check
npm test
```

I test usano Microsoft Edge installato sul computer. Se necessario, installalo con `npx playwright install msedge`, oppure adatta `channel` in `playwright.config.js` al browser disponibile.

Per cambiare i progetti, modifica le schede e i rispettivi `<template>` in `index.html`: `data-project="triskele"` corrisponde a `id="project-triskele"`. Per aggiornare il CV, sostituisci `assets/francesco-raciti-cv.pdf` e aggiorna il nome del download nell'HTML.

I valori `--scene-x` e `--scene-y` nel CSS controllano il ritaglio della hero. Le coordinate dei bagliori e degli editor fanno riferimento all'immagine da 1122 × 720 pixel e vanno aggiornate se cambia la fotografia.

Le sezioni restano leggibili senza JavaScript. I controlli che lo richiedono vengono mostrati solo dopo l'inizializzazione. Il form non invia dati a un server: apre il programma email dell'utente, che deve confermare l'invio.

## Pubblicazione

Configura il dominio reale in `seo.config.json`, esegui `npm run seo` e verifica con `npm run seo:check`. Carica `index.html`, `robots.txt`, `sitemap.xml` e le cartelle `css`, `js` e `assets` su un hosting statico con HTTPS. Il sito non richiede una build dell'applicazione; i metadati vengono generati prima della pubblicazione. Non pubblicare `node_modules`, test o file di configurazione degli strumenti.

La gestione di canonical, dati strutturati, sitemap e verifica Search Console è descritta in [SEO.md](./SEO.md). L'indicizzazione richiede un dominio pubblico e la verifica della proprietà in Google Search Console.

## Crediti

Icone delle tecnologie: [Devicon](https://github.com/devicons/devicon), licenza MIT inclusa in `assets/icons/LICENSE`. Le icone sono copie locali; il sito non richiede servizi esterni per visualizzarle. I marchi appartengono ai rispettivi titolari.
