
# Portfolio - Istruzioni del progetto

## Architettura e contenuti

- Il portfolio è statico: HTML, CSS e moduli JavaScript ES, senza framework applicativo. Mantieni questa struttura e le convenzioni esistenti.
- I contenuti sono in `index.html`, gli stili in `css/style.css` e i comportamenti nei moduli di `js/`, con ingresso `js/main.js`.
- Mantieni leggibili i contenuti senza JavaScript e rispetta navigazione da tastiera, movimento ridotto e layout responsive.
- Nei testi sull'intelligenza artificiale usa formulazioni generiche, senza nomi di prodotti o fornitori.
- I metadati SEO provengono da `seo.config.json`: per aggiornarli usa `npm run seo`; evita modifiche manuali nel blocco generato dell'HTML.

## Verifiche pertinenti

- Testi e CSS: verifica mirata delle parti modificate; controllo visivo solo se il layout è interessato.
- Comportamenti interattivi: seleziona i test Playwright pertinenti in `tests/`, ampliando la copertura solo quando necessario.
- Generatore SEO: `npm run test:seo`; coerenza dei file pubblici: `npm run seo:check`.
- Formattazione: limita Prettier ai file modificati. Le modifiche alla sola configurazione delle istruzioni non richiedono build o test applicativi.
