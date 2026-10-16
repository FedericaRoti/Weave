# Roadmap — Weave

Aggiornata il 16 ottobre 2026. La [scadenza ufficiale](https://amazonappdev2026.devpost.com/rules) è il 23 ottobre 2026 alle 12:00 PDT, cioè le 21:00 in Italia.

## Risultato già ottenuto

- La vertical slice *The Last Signal* è giocabile: due ruoli, tre prove, rivelazione, scelta finale con due voti, stato condiviso e aggiornamenti SSE.
- La shell Vega WebView è stata generata, compilata e installata/avviata nel Vega Virtual Device. Il processo Weave e il renderer risultano visibili/pronti; il simulatore raggiunge il server attraverso VDA reverse.
- Il percorso completo tra due viste browser TV è stato verificato, inclusa la sincronizzazione a ogni prova e il finale concordato. Il puzzle non parte più dai numeri-base dell'altro ruolo.
- Il narratore può usare un modello Ollama locale per interpretare domande libere e selezionare soltanto fatti canonici accessibili al ruolo. Senza modello resta il fallback deterministico. Nessun AWS o servizio a pagamento è stato attivato.
- Test motore/narratore: 10 superati. Test, lint e typecheck della shell Vega superati.

## Gate prima della candidatura

1. **Prova visiva sul Vega Virtual Device.** Controllare nella finestra del simulatore che la WebView mostri entrambe le scene e che frecce/Seleziona raggiungano e attivino i controlli. La sola installazione/visibilità del processo non dimostra questo punto. Correggere eventuali problemi di layout/focus.
2. **Video reale, massimo 2:59.** Registrare la finestra del simulatore mentre Weave funziona, con due postazioni e il companion. Aggiungere narrazione o sottotitoli inglesi e caricarlo pubblicamente su YouTube/Vimeo. Non usare soltanto il browser desktop nel video: le [regole Fire TV](https://amazonappdev2026.devpost.com/rules) richiedono device o simulatore.
3. **Repository accessibile ai giudici.** Scelta confermata: GitHub privato, condiviso con gli account indicati dalle [regole](https://amazonappdev2026.devpost.com/rules): `chris-trag`, `knmeiss`, `giolaq`, `anishamalde`, `mosesroth`, `emersonsklar`. Git locale è stato inizializzato, ma non ci sono ancora commit né repository remoto. Includere codice, asset e setup in inglese.
4. **Submission Devpost.** Compilare descrizione, link repo/video, track Fire TV e feedback sugli strumenti. La submission finale comporta accettazione delle regole; va verificata con l'utente prima dell'invio.

## Dopo il gate, solo se resta tempo

- Playtest senza spiegazioni con una coppia esterna; correggere i blocchi principali.
- Migliorare connessione companion via QR e hosting fra case. La demo attuale è una sessione locale su host condiviso, non ancora un servizio remoto autenticato.
- Valutare chiamata voce integrata solo se aumenta chiaramente il valore rispetto a una chiamata separata.

## Decisioni di ambito

La track Fire TV richiede un'app demo-ready su Fire OS/Vega OS; l'AI è una categoria prioritaria, non un requisito obbligatorio. Il video pubblico e il repository accessibile sono obbligatori. AWS Builder è una mini-challenge facoltativa; le regole riportano che i codici promozionali AWS erano esauriti dal 7 ottobre. Nessuna spesa o pubblicazione va presunta dal lavoro locale.
