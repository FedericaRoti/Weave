# Weave

## Ipotesi di prodotto

Weave e un'esperienza narrativa cooperativa per due persone in case diverse. Ogni persona avvia l'app sulla propria Fire TV, riceve una prospettiva parziale dello stesso mondo e collabora in tempo reale per raggiungere un obiettivo comune. Il telefono e un companion privato per connessione, comunicazione e indizi di ruolo.

## Promessa

Trasformare due salotti lontani in due luoghi della stessa storia: ogni persona ha informazioni che all'altra mancano e le azioni di gioco producono conseguenze visibili in entrambe le case.

## Vincoli di esperienza

- Fire TV e un'esperienza avviata intenzionalmente in foreground.
- Il gioco non dipende da overlay, accensione TV, Ring o sincronizzazione di contenuti di terze parti.
- Le TV mostrano scene immersive leggibili da distanza; il telefono non replica la scena TV.
- La voce tra giocatori e separata dal narratore AI e non viene acquisita per default.
- Le azioni e lo stato sono governati da regole deterministiche.
- Il narratore risponde solo a richieste esplicite e ai fatti disponibili; non modifica lo stato e non inventa la soluzione.

## Caso dimostrativo corrente

*The Last Signal* è la proposta di una stazione di ricerca vista nel 1998 e nel 2034, con operatrice e analista che ricostruiscono una trasmissione corrotta. Il canto di balena è la rivelazione intermedia; il finale mette in gioco la scelta di pubblicare o sigillare le coordinate di un'area di riproduzione. Vedere [CASE_BIBLE.md](CASE_BIBLE.md) per la bozza v0.3. È un'ambientazione prototipo, non un vincolo per casi futuri.

Le giocatrici sanno dall'inizio che le loro azioni incidono sulla stessa ricostruzione e vedono un feedback immediato sull'altra TV; scoprono giocando il significato del segnale e le sue conseguenze.

## Nome

`Weave` e il nome di lavoro scelto per il progetto; disponibilita Appstore e verifica marchio restano aperte prima della pubblicazione.

## Fonte del dettaglio MVP

Vedere [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md). La shell Vega è stata compilata, installata e avviata nel Virtual Device, ma la finestra grafica e il D-pad richiedono ancora un controllo manuale. Il narratore AI locale è stato verificato in browser; voce integrata e sessione Internet fra case diverse non sono implementate.
