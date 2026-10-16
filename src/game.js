const FRAGMENT_CHOICES = {
  "03-04-09-10": ["03", "04", "09", "10"],
  "03-08-09-10": ["03", "08", "09", "10"],
  "03-04-05-10": ["03", "04", "05", "10"],
  "03-09-10-11": ["03", "09", "10", "11"],
};

const CORRECT_FRAGMENT_SET = "03-04-09-10";

function freshState(generation = 0) {
  return {
    code: "NEREIDE",
    generation,
    version: 0,
    phase: "carrier",
    frequency: 16.0,
    bearing: 60,
    selectedFragments: null,
    revealed: false,
    votes: { "1998": null, "2034": null },
    finalChoice: null,
    lastResult: "Il file è a rischio cancellazione. Stabilizzate la traccia prima che il buffer si chiuda.",
    history: [{ id: 1, title: "Sessione aperta", detail: "Due postazioni. Un solo segnale da ricostruire.", at: Date.now() }],
  };
}

function rounded(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function addHistory(state, title, detail) {
  state.history.unshift({ id: state.version + 1, title, detail, at: Date.now() });
  state.history = state.history.slice(0, 8);
}

function result(state, ok, message) {
  if (!ok) state.lastResult = message;
  return { ok, message, state: structuredClone(state) };
}

export function createGameStore() {
  let generation = 0;
  let state = freshState(generation);
  const listeners = new Set();

  function publish() {
    state.version += 1;
    const snapshot = structuredClone(state);
    for (const listener of listeners) listener(snapshot);
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function act({ actor, type, value }) {
    if (!["1998", "2034"].includes(actor)) return result(state, false, "Postazione non riconosciuta.");
    if (state.phase === "complete") return result(state, false, "La sessione è già conclusa.");

    if (type === "tune-frequency") {
      if (actor !== "1998" || state.phase !== "carrier") return result(state, false, "La console analogica non è attiva per questa prova.");
      const next = rounded(Number(value));
      if (!Number.isFinite(next) || next < 16 || next > 18) return result(state, false, "La frequenza deve restare tra 16,0 e 18,0 MHz.");
      state.frequency = next;
      if (next === 17.2) {
        state.phase = "bearing";
        state.lastResult = "Portante agganciata. Nell’archivio compare un secondo asse: la direzione.";
        addHistory(state, "Portante stabilizzata", "La traccia si aggancia a 17,2 MHz.");
      } else {
        state.lastResult = `A ${next.toFixed(1)} MHz la portante resta instabile.`;
      }
      publish();
      return result(state, true, state.lastResult);
    }

    if (type === "set-bearing") {
      if (actor !== "1998" || state.phase !== "bearing") return result(state, false, "La direzione si sblocca dopo aver stabilizzato la portante.");
      const next = Math.round(Number(value));
      if (!Number.isFinite(next) || next < 0 || next > 359) return result(state, false, "La direzione deve essere compresa tra 000° e 359°.");
      state.bearing = next;
      if (next === 71) {
        state.phase = "reconstruction";
        state.lastResult = "Il marker lascia la sigla SOS. L’archivio ha trovato quattro frammenti candidati.";
        addHistory(state, "Nereide agganciata", "La traccia si sposta dal marker SOS verso il ricevitore remoto.");
      } else {
        state.lastResult = `A ${String(next).padStart(3, "0")}° il marker non raggiunge il ricevitore.`;
      }
      publish();
      return result(state, true, state.lastResult);
    }

    if (type === "select-fragments") {
      if (actor !== "2034" || state.phase !== "reconstruction") return result(state, false, "L’indice dei frammenti non è ancora disponibile.");
      if (!Object.hasOwn(FRAGMENT_CHOICES, value)) return result(state, false, "Sequenza non presente nell’indice.");
      state.selectedFragments = FRAGMENT_CHOICES[value];
      if (value === CORRECT_FRAGMENT_SET) {
        state.phase = "archive-choice";
        state.revealed = true;
        state.lastResult = "La voce emerge dal rumore: non era un SOS. Dopo il canto, una nota di Elisa: «Salvate la voce. Cancellate la rotta». Ora decidete cosa rendere pubblico.";
        addHistory(state, "Voce recuperata", "Il falso SOS era una vocalizzazione di balene. Una nota apre un dilemma sull’archivio.");
      } else {
        state.lastResult = "La sequenza non combacia con il ritmo ricevuto. I frammenti restano disponibili per un nuovo confronto.";
      }
      publish();
      return result(state, true, state.lastResult);
    }

    if (type === "vote-archive") {
      if (state.phase !== "archive-choice" || !["publish", "seal"].includes(value)) return result(state, false, "La scelta d’archivio non è disponibile.");
      state.votes[actor] = value;
      const other = actor === "1998" ? "2034" : "1998";
      if (state.votes[other] === value) {
        state.finalChoice = value;
        state.phase = "complete";
        const detail = value === "publish"
          ? "La registrazione e le coordinate vengono pubblicate: la prova è verificabile, ma la baia è esposta."
          : "La registrazione viene conservata e le coordinate sigillate: la baia è protetta, ma il luogo resta non verificabile pubblicamente.";
        state.lastResult = detail;
        addHistory(state, value === "publish" ? "Archivio reso pubblico" : "Coordinate sigillate", detail);
      } else {
      state.lastResult = state.votes[other]
        ? "Le scelte non coincidono ancora. Parlatevi e poi votate di nuovo."
        : "Voto registrato. Aspetta la scelta dell’altra postazione.";
      }
      publish();
      return result(state, true, state.lastResult);
    }

    return result(state, false, "Azione non riconosciuta.");
  }

  return {
    getState: () => structuredClone(state),
    subscribe,
    act,
    reset() {
      generation += 1;
      state = freshState(generation);
      publish();
      return structuredClone(state);
    },
  };
}

function currentHint(state) {
  if (state.phase === "carrier") return "Confrontate la banda di riferimento con la calibrazione della console. Il valore richiesto è una somma, non una scelta a intuito.";
  if (state.phase === "bearing") return "L’archivio fornisce il bearing reale; la bussola analogica ha uno scarto. Correggete il valore prima di impostarlo.";
  if (state.phase === "reconstruction") return "Confrontate il ritmo ascoltato nel 1998 con gli intervalli fra i frammenti dell’archivio.";
  if (state.phase === "archive-choice") return "Non c’è una scelta perfetta: discutete quanto pesano la verificabilità della prova e la protezione della baia.";
  return "La sessione è completa. Potete riavviarla dalla schermata iniziale.";
}

export function answerNarratorQuestion({ question, role, state }) {
  const text = String(question ?? "").trim().toLocaleLowerCase("it");
  if (!text) return "Scrivi una domanda sul segnale, sugli indizi o sul prossimo passo.";
  if (!["1998", "2034"].includes(role)) return "Prima scegli la tua postazione: radio 1998 o archivio 2034.";

  if (/sugger|aiut|blocc|prossim|cosa faccio|che faccio|cosa fare|non so|come proced|indizi/.test(text)) return currentHint(state);
  if (/altr[oa].*(vede|sa|indizi)|cosa vede|cosa sa|indizio.*altr/.test(text)) return "Non posso rivelare gli indizi privati dell’altra postazione. Chiediglieli direttamente: la collaborazione fa parte della ricostruzione.";
  if (/colpevol|sabot|colpa|responsabil/.test(text) && state.revealed) return "Non ci fu sabotaggio: il temporale danneggiò la registrazione e il classificatore la scambiò per un'emergenza. Elisa aveva nascosto la rotta per proteggere la baia.";
  if (/colpevol|sabot|colpa|responsabil/.test(text)) return "Il rapporto attribuisce un errore a Elisa, ma un’accusa non è una prova. Con i dati disponibili non posso confermare un sabotaggio.";
  if (/balen|canto|sos|soccorso/.test(text) && !state.revealed) return "Per ora il catalogo mostra l’etichetta SOS, non il contenuto verificato. Prima stabilizzate e ricostruite la traccia.";
  if (/balen|canto|sos|soccorso/.test(text) && state.revealed) return "La registrazione contiene una vocalizzazione di balene, non una richiesta di soccorso. Elisa aveva deviato il segnale verso Nereide per conservarlo senza rendere pubblica la posizione precisa della baia.";
  if (/elisa|nota|rotta|bearing/.test(text) && state.revealed) return "Elisa deviò intenzionalmente la trasmissione verso Nereide per salvare la registrazione, ma nascose il bearing preciso per proteggere l’area di riproduzione.";
  if (/soluzion|risposta finale|dimmi tutto|cosa è successo/.test(text) && state.revealed) return "La registrazione non era un SOS: il temporale danneggiò il file e il classificatore scambiò gli impulsi per un’emergenza. Elisa aveva salvato una vocalizzazione di balene e nascosto la rotta per proteggere la baia. Ora decidete se pubblicare le coordinate o sigillarle.";
  if (/elisa|nota|rotta|bearing/.test(text) && !state.revealed) return "Nei dati accessibili finora non c’è una spiegazione completa della scelta di Elisa. Ricostruite prima la registrazione.";
  if (/pubblic|coordinate|sigill|scelta|archiv/.test(text) && state.phase === "archive-choice") return "Pubblicare rende la prova più verificabile ma espone la posizione; sigillare protegge la baia ma riduce la verificabilità pubblica. La decisione spetta a voi.";
  if (/soluzion|risposta finale|dimmi tutto/.test(text) && !state.revealed) return "Non anticipo la soluzione prima che la traccia sia ricostruita. Posso però darvi il prossimo suggerimento: " + currentHint(state);

  return "Non ho elementi sufficienti per rispondere senza inventare. Confronta la domanda con gli indizi disponibili oppure chiedimi un suggerimento.";
}
