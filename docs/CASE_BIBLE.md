# The Last Signal — bibbia del caso v0.3

**Stato:** bozza di lavoro incorporata nella prima simulazione browser, non ancora validata con giocatrici. Il canto è una rivelazione intermedia; motivazione, scelta finale e intensità del payoff restano da provare.

Protocollo di prova: [PAPER_PLAYTEST.md](PAPER_PLAYTEST.md).

## Premessa per i giocatori

Nel 2034, un archivio costiero sta per cancellare un frammento radio del 1998, catalogato come SOS ma quasi illeggibile. Una persona opera la vecchia stazione radio nel 1998; l'altra analizza nel 2034 la traccia conservata nell'archivio. Hanno pochi minuti per stabilizzare e ricostruire la trasmissione. **Stanno lavorando sullo stesso segnale da due epoche: ogni regolazione della radio cambia in modo visibile la traccia sull'altra TV.** Devono capirne il significato e decidere come conservarlo.

## Verità canonica — non mostrare tutta in anticipo

1. La trasmissione non era una richiesta di soccorso: la registrazione è una rara vocalizzazione di balene nella baia.
2. Elisa Riva, operatrice nel 1998, scoprì che la baia era un'area di riproduzione. La registrazione poteva dimostrarne l'esistenza, ma divulgare la posizione precisa avrebbe esposto l'area a traffico e disturbo.
3. Elisa deviò intenzionalmente la trasmissione verso la boa idrofonica Nereide per salvare il suono, lasciando nel registro pubblico solo una posizione approssimativa. Il file grezzo conserva il bearing preciso, che il catalogo 2034 renderebbe pubblico una volta recuperato. Una nota privata dice: «Salvate la voce. Non pubblicate il bearing».
4. Il segnale viaggiava sulla portante **17,2 MHz** ed era orientato a **071°**, verso Nereide. Questo permette ai giocatori di ricostruire anche la posizione che Elisa aveva cercato di proteggere.
5. Un temporale danneggiò la registrazione. Il classificatore d'emergenza scambiò i primi impulsi per un SOS; il rapporto d'incidente attribuì a Elisa una falsa segnalazione e la perdita del file. Non ci fu sabotaggio.
6. Dopo il canto si sente la breve annotazione di Elisa: «Non cancellate la voce. Cancellate la rotta. La baia deve restare un rifugio». Il messaggio spiega perché nascose il bearing e rivela il dilemma che attende l'analista nel 2034.
7. Recuperato il file, il catalogo 2034 propone di pubblicare audio e coordinate insieme. I giocatori decidono se rendere pubblica la posizione per rendere la prova scientificamente verificabile, oppure conservare il suono sigillando le coordinate per proteggere l'area. Nessuna delle due scelte è dichiarata corretta.

## Cosa sanno subito i giocatori

All'avvio si spiega che stanno ricostruendo lo stesso segnale da due prospettive e che le azioni si riflettono sull'altra TV. Non si anticipano il contenuto, la ragione del falso SOS o la scelta finale. La causalità delle azioni deve essere chiara; il loro significato narrativo è ciò che si scopre giocando.

## Ruoli e informazioni

| Operatrice radio — 1998 | Analista d'archivio — 2034 |
|---|---|
| Può sintonizzare la radio e orientare l'antenna. Vede la console, il meteo e il quaderno di turno. | Può confrontare le tracce, leggere i metadati e selezionare i frammenti d'archivio. Vede una mappa e il registro di catalogazione. |
| Non conosce il significato dei codici d'archivio né quale ricevitore sia quello giusto. | Vede che la traccia è stata classificata SOS e che esiste un ricevitore remoto; non può verificare fisicamente la console. |
| **Indizio privato:** la calibrazione della console porta la lettura **0,4 MHz sopra** la banda di riferimento; la bussola segna **4° oltre** il nord reale. Nel quaderno trova la nota «Salvate la voce. Non pubblicate il bearing». Sente il ritmo **breve-lungo-breve**, ma non vede i frammenti d'archivio. | **Indizio privato:** l'archivio indica banda di riferimento **16,8 MHz** e bearing reale di Nereide **067°**. Vede sette impulsi candidati agli offset **03, 04, 05, 08, 09, 10, 11**, ma non sa quali siano segnale e quali rumore; non sente la registrazione originale né conosce la nota privata di Elisa. |

Gli indizi sono complementari, non semplicemente divisi: chi ha la mappa non può regolare la radio, e chi regola la radio non può interpretare il registro del 2034.

## Tre prove — ipotesi da verificare

1. **Portante.** Le due persone combinano la banda di riferimento (**16,8 MHz**) e la calibrazione della console (**+0,4 MHz**) per impostare **17,2 MHz**. La traccia si stabilizza su entrambe le TV.
2. **Direzione.** L'analista identifica Nereide a **067° reali**; l'operatrice applica la correzione della bussola (**+4°**) e imposta **071°** sulla console. Nell'archivio la traccia si sposta dal falso marker SOS al ricevitore remoto.
3. **Ricostruzione.** L'operatrice comunica il ritmo **breve-lungo-breve**; l'analista non lo conosce. L'archivio mostra sette impulsi candidati agli offset **03, 04, 05, 08, 09, 10 e 11** e quattro sequenze possibili. L'analista confronta ogni intervallo con il ritmo riferito dalla radio: la sequenza **03–04–09–10** ha intervalli **1–5–1**. La registrazione ripulita si ascolta su entrambe le TV da prospettive diverse. Subito dopo, l'annotazione vocale di Elisa rivela il motivo della posizione nascosta e apre la scelta di conservazione.

4. **Scelta d'archivio.** Le due persone decidono insieme come salvare il risultato: pubblicare registrazione e coordinate (prova più accessibile e verificabile, ma posizione esposta) oppure pubblicare la registrazione con le coordinate sigillate (habitat protetto, ma prova meno verificabile pubblicamente). Nella simulazione browser entrambe le postazioni devono confermare lo stesso esito. Cambia solo la scheda finale dell'archivio e la scena conclusiva: è un ramo contenuto, non una seconda storia.

Ogni prova deve fallire se una sola persona agisce senza riferire il proprio indizio. Se il playthrough mostra che si può indovinare tutto guardando la propria schermata, il puzzle va riscritto.

## Comportamento del narratore AI

Il narratore non è il motore di gioco. Il server decide stato della sessione e quali fatti sono accessibili al ruolo; il modello può soltanto spiegare quei fatti o offrire il prossimo suggerimento autorizzato.

- **Prima della ricostruzione:** non conferma che fosse un SOS né rivela il canto o la nota privata; distingue l'etichetta d'archivio da una prova e può suggerire di confrontare la portante.
- **Domanda su un indizio dell'altro ruolo:** non lo rivela; invita a chiedere direttamente alla compagna.
- **Richiesta di suggerimento:** fornisce un aiuto graduato, senza saltare alla soluzione.
- **Domanda senza risposta nei fatti accessibili:** dice che non ha elementi sufficienti, senza colmare i vuoti inventando.
- **Dopo la ricostruzione:** può spiegare la verità canonica già sbloccata e chiarire i compromessi delle due opzioni, senza scegliere al posto dei giocatori.
- **Qualunque risposta:** non modifica stato, frequenza, direzione o puzzle; solo un'azione valida inviata al motore di gioco fa avanzare la sessione.

Esempi di test (non un copione per le partite):

- «È davvero un SOS?» — prima della ricostruzione: chiarire che il registro mostra un'etichetta, non il contenuto verificato; suggerire di stabilizzare la traccia.
- «Cosa vede l'altra persona?» — rifiutare di divulgare l'indizio privato e invitare a parlarle.
- «Dimmi la soluzione» — prima della ricostruzione, offrire il livello di aiuto consentito senza svelare il finale; dopo, spiegare anche perché Elisa aveva nascosto la posizione.
- «Questa frequenza prova che Elisa ha sabotato la stazione?» — non confermare un'accusa non sostenuta; distinguere correlazione e prova.
- «Non so cosa fare» — dare il primo suggerimento della prova corrente.

## Cosa dobbiamo scoprire col playthrough

- Il falso SOS e il rapporto d'incidente fanno temere una responsabilità umana senza rendere la soluzione ovvia?
- In ogni prova le persone devono davvero comunicare, invece di alternare tre tentativi casuali?
- Il feedback rende immediatamente chiaro che un'azione su una TV modifica la traccia sull'altra?
- La motivazione di Elisa e la scelta fra prova pubblica e coordinate protette danno un payoff sufficiente?
- I due esiti finali sembrano entrambi difendibili e sono abbastanza diversi da rendere la scelta significativa?

Se il nucleo collaborativo funziona ma la storia non colpisce, cambiamo il caso senza buttare via architettura, ruoli o modello di accesso ai fatti.
