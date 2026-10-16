# Weave — product brief MVP

**Stato:** vertical slice browser giocabile con shell Vega WebView costruita e avviata nel simulatore; resa/focus D-pad e playtest esterno ancora da validare. La sessione fra case diverse resta un obiettivo, non una funzione del prototipo locale.

**Chiarimento sulla demo:** le viste Radio e Archivio nel browser rappresentano le due schermate TV. Aprirle sui telefoni serve solo come sostituto temporaneo per osservare entrambe le postazioni; il companion narratore è la vista dedicata al telefono.

## Per chi e perche

Due amici o familiari che vivono in case diverse e vogliono fare qualcosa insieme durante una chiamata, invece di limitarsi a guardare lo stesso contenuto. Ipotesi iniziale: accettano di avviare volontariamente un'esperienza Fire TV e dedicarle circa 15 minuti.

## Promessa

Due salotti diventano due prospettive dello stesso luogo. Ogni persona riceve informazioni che l'altra non ha; le azioni di una cambiano cio che l'altra puo vedere. La storia avanza solo quando collaborano.

## MVP proposto

- Due partecipanti, due case, una sessione sincrona di 12–15 minuti.
- L'app Fire TV e avviata intenzionalmente su entrambe le televisioni.
- Il telefono entra nella sessione tramite QR e fornisce il ruolo privato, la comunicazione vocale e il comando esplicito per chiedere al narratore.
- Le TV sono due scene immersive navigabili con D-pad; non sono due dashboard e non mostrano gli stessi indizi.
- Il server mantiene lo stato canonico. Ogni azione valida aggiorna entrambe le prospettive.
- La voce tra giocatori resta separata dal narratore e non viene acquisita o trascritta dal gioco.
- L'AI risponde solo a richieste inviate esplicitamente. Nella vertical slice un modello locale opzionale interpreta la domanda e seleziona ID di fatti canonici accessibili a quel ruolo; il server compone la risposta da quei fatti. Il fallback deterministico dà suggerimenti graduati. Nessuno dei due modifica lo stato o anticipa la soluzione.

## Caso dimostrativo: The Last Signal

Una stazione di ricerca costiera appare in due momenti, 1998 e 2034. I giocatori devono recuperare il contenuto di una trasmissione corrotta prima che l'archivio del 2034 la cancelli.

- **Operatrice nel 1998:** vede la sala radio, la console analogica e i controlli dell'antenna; puo cambiare un'impostazione per volta.
- **Analista nel 2034:** vede l'archivio, le tracce del segnale e la mappa; interpreta gli effetti delle modifiche e possiede il registro con le chiavi di lettura.
- **Prova 1 — portante:** l'operatrice conosce la correzione della console (+0,4 MHz); l'analista la banda di riferimento (16,8 MHz). Insieme ricavano la portante di 17,2 MHz.
- **Prova 2 — direzione:** l'analista conosce il bearing reale di Nereide (067°); l'operatrice sa che la bussola della console segna 4° oltre il nord reale. Insieme impostano 071°.
- **Prova 3 — ricostruzione:** l'operatrice sente il ritmo degli impulsi; l'analista vede i frammenti d'archivio ma non sa quali siano segnale o rumore. Insieme selezionano la registrazione corretta.

La verità canonica e il dilemma finale sono abbozzati in [bibbia del caso](CASE_BIBLE.md) v0.3: il canto è una rivelazione intermedia; i giocatori decidono se pubblicare le coordinate della baia o sigillarle. La bozza si prova prima nella simulazione browser; la prova su carta resta facoltativa se serve isolare un problema del caso.

## Loop di gioco

1. Le due persone si collegano con lo stesso codice e ricevono ruoli diversi.
2. Ognuna osserva la propria scena e il proprio indizio privato.
3. Parlano tra loro; quando serve, inviano una domanda esplicita al narratore dal telefono.
4. Una persona compie un'azione discreta con il telecomando.
5. L'altra vede la conseguenza nella propria scena, interpreta il risultato e passa l'informazione.
6. Completano tre passaggi e sbloccano una conclusione condivisa.

## Criteri di riuscita del prototipo

- Due giocatori capiscono obiettivo e ruoli entro il primo minuto senza spiegazione esterna.
- Capiscono subito che stanno lavorando sullo stesso segnale e vedono il feedback reciproco alla prima azione.
- Nessuna delle tre prove e risolvibile da una sola prospettiva.
- Una modifica a una TV produce una conseguenza visibile sull'altra entro due secondi in condizioni di rete normali.
- La sessione arriva a una conclusione in 12–15 minuti.
- La scelta d'archivio finale ha due esiti comprensibili e una conseguenza visiva, senza richiedere una seconda storia completa.
- Le domande fuori ambito o premature del narratore non aggiungono fatti al caso e non alterano la soluzione.
- Il video di candidatura dovrà mostrare Weave in esecuzione sul simulatore Fire TV/Vega o su Fire TV, come richiedono le regole. Non è ancora stato registrato.

## Rischi da verificare presto

- Compatibilita reale delle tecnologie Fire TV/Vega con il client TV scelto.
- Avvio affidabile di due client/schermate per la demo.
- Audio integrato tra telefoni: valutare un servizio WebRTC gestito in uno spike breve.
- Valore percepito del cambio di prospettiva: il gioco deve costringere a coordinarsi, non limitarsi a dividere indizi.
- Narratore AI: valutare Bedrock solo dopo aver definito il modello di verita e il fallback deterministico.

## Fuori scope per la prima demo

Accensione o overlay sopra altre app TV, videocamera, generazione di scene in tempo reale, piu di un caso, matchmaking pubblico, profili persistenti e chiamata video.
