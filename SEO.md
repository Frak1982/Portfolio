# SEO e indicizzazione del portfolio

Il sito è configurato per **https://frak1982.github.io/Portfolio/**. Canonical, sitemap, dati strutturati e immagini social conservano il percorso `/Portfolio/`, incluse le maiuscole.

## Attivazione su GitHub Pages

1. Pubblica le modifiche nel repository `Frak1982/Portfolio`, usando la sorgente configurata in **Settings → Pages**. Le modifiche locali non aggiornano da sole il sito pubblico.
2. In Search Console scegli una proprietà **Prefisso URL** e inserisci `https://frak1982.github.io/Portfolio/`. Per questo indirizzo GitHub Pages non puoi aggiungere record DNS al dominio `github.io`: usa il metodo **Tag HTML**.
3. Copia soltanto il valore `content` del tag fornito da Google nel campo `googleSiteVerification` di `seo.config.json`, esegui `npm run seo` e pubblica l'HTML aggiornato. Torna su Google e conferma la verifica.
4. Invia la sitemap `https://frak1982.github.io/Portfolio/sitemap.xml` e richiedi l'indicizzazione della homepage con Controllo URL.

Google cerca il file robots soltanto su `https://frak1982.github.io/robots.txt`: quello pubblicato in `/Portfolio/robots.txt` non governa la scansione. Se gestisci anche il repository del sito utente `frak1982.github.io`, puoi pubblicare lì il file robots generato da questo progetto, con la direttiva Sitemap. Non è necessario creare quel repository soltanto per indicizzare il portfolio: puoi inviare direttamente la sitemap a Search Console. Un eventuale robots alla radice che blocca `/Portfolio/` deve invece essere corretto alla radice.

GitHub Pages gestisce HTTPS dalle proprie impostazioni; non supporta regole server personalizzate come `.htaccess`. Il canonical identifica la homepage preferita anche quando `/Portfolio/index.html` è raggiungibile.

## Gestione dei metadati

`seo.config.json` è la fonte dei metadati: titolo, descrizione, identità professionale, profilo LinkedIn, dominio pubblico e verifica Google. Il generatore produce HTML statico, leggibile dai motori anche senza eseguire JavaScript.

```sh
npm run seo
npm run test:seo
```

Il blocco `SEO:START` / `SEO:END` in `index.html` è generato: modifica la configurazione e rigeneralo, evitando modifiche manuali al suo interno. I testi visibili della pagina vanno aggiornati direttamente nell'HTML, mantenendoli coerenti con i metadati.

## Configurare il dominio definitivo

Imposta `siteUrl` con il vero indirizzo HTTPS pubblico, oppure usa:

```sh
npm run seo -- --url https://DOMINIO-REALE/
npm run seo:check
```

Sostituisci `DOMINIO-REALE` con il tuo dominio. Non usare localhost, URL di anteprima, domini di esempio o il dominio di un progetto cliente.

Il comando genera insieme:

- URL canonico della homepage e URL delle anteprime social;
- dati strutturati `ProfilePage` / `Person`, collegati al profilo LinkedIn;
- `robots.txt`, che permette la scansione delle risorse pubbliche;
- `sitemap.xml`, con l'unica pagina effettiva del sito.

Le sezioni `#progetti`, `#competenze` e `#contatti` sono frammenti della stessa pagina e non vengono inserite come pagine separate nella sitemap. Non vengono generate date di aggiornamento fittizie. Senza un dominio configurato, il sito mantiene i metadati locali ma non pubblica canonical o sitemap con indirizzi inventati; `seo:check` segnala la configurazione incompleta.

## Pubblicazione e Google Search Console

1. Pubblica `index.html`, `robots.txt`, `sitemap.xml` e le cartelle `assets`, `css`, `js` sul dominio HTTPS. `robots.txt` deve essere disponibile alla radice del dominio; per un sito in una sottocartella integra la direttiva Sitemap nel robots della radice.
2. Imposta sul tuo hosting i reindirizzamenti permanenti da HTTP a HTTPS, dalla variante www/non-www secondaria a quella scelta e da `/index.html` alla homepage. La sintassi dipende dal provider: non è gestita dal server locale.
3. Aggiungi il dominio in [Google Search Console](https://search.google.com/search-console). Verifica la proprietà tramite record DNS; in alternativa, per una proprietà con prefisso URL, copia il token del metodo "Tag HTML" in `googleSiteVerification` e riesegui `npm run seo` prima di pubblicare.
4. In Search Console, sezione Sitemap, invia l'URL pubblico di `sitemap.xml`.
5. Usa "Controllo URL" sulla homepage, verifica la pagina pubblicata e richiedi l'indicizzazione. La richiesta richiede l'accesso alla proprietà verificata.
6. Verifica i dati con il [Rich Results Test](https://search.google.com/test/rich-results) e controlla nel tempo i rapporti Indicizzazione e Rendimento.

La verifica della proprietà e la richiesta di indicizzazione non sono state eseguite dal codice: richiedono il sito pubblico e il tuo account Google. Una sitemap aiuta la scoperta, ma non garantisce l'indicizzazione o una posizione specifica. Un sito accessibile soltanto su `127.0.0.1` non è raggiungibile da Google.

## Obiettivi e contenuti

Le ricerche coerenti con i contenuti attuali sono il tuo nome e il tuo profilo professionale, ad esempio "Francesco Raciti sviluppatore Angular" e "sviluppatore Angular Padova". Non sono previsioni di volume o promesse di posizionamento.

Per aumentare la qualità delle informazioni, aggiungi per i progetti pubblicabili: il problema affrontato, il tuo contributo, le tecnologie usate e risultati verificabili. Se crei vere pagine dedicate ai progetti, assegna loro URL, titoli e contenuti distinti e aggiorna generatore e sitemap. Non pubblicare pagine quasi identiche solo per ripetere parole chiave.

Mantieni aggiornato LinkedIn con un collegamento al portfolio e condividi i progetti nei canali pertinenti. Non servono elenchi nascosti di parole chiave, recensioni inventate, acquisto di link o richieste ripetute di indicizzazione. Le anteprime Open Graph e Twitter migliorano la condivisione; non garantiscono un aumento del ranking.

## Fonti ufficiali

- [Guida introduttiva SEO di Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Dati strutturati per pagine profilo](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Creare e inviare una sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Richiedere una nuova scansione](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
