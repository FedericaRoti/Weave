const app = document.querySelector("#app");
const params = new URLSearchParams(location.search);
const screen = params.get("screen") ?? "home";
const tvMode = params.get("tv") === "1";
const tvQuery = tvMode ? "&tv=1" : "";
document.body.classList.toggle("tv-mode", tvMode);
const PHASES = [
  ["carrier", "Aggancia la portante"],
  ["bearing", "Trova Nereide"],
  ["reconstruction", "Ricostruisci la voce"],
  ["archive-choice", "Scegli cosa conservare"],
];
const FRAGMENTS = ["03-04-09-10", "03-08-09-10", "03-04-05-10", "03-09-10-11"];

let state;
let toastTimer;
let conversation = [];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function toast(message, error = false) {
  document.querySelector(".toast")?.remove();
  const element = document.createElement("div");
  element.className = `toast${error ? " error" : ""}`;
  element.textContent = message;
  document.body.append(element);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.remove(), 3200);
}

async function post(path, payload = {}) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok || data.ok === false) throw new Error(data.message ?? "Richiesta non riuscita.");
  return data;
}

async function act(actor, type, value) {
  try {
    const data = await post("/api/action", { actor, type, value });
    state = data.state;
    render();
    if (type === "vote-archive" && data.message.includes("Voto registrato")) toast(data.message);
  } catch (error) {
    toast(error.message, true);
  }
}

function phaseIndex() {
  return PHASES.findIndex(([key]) => key === state?.phase);
}

function phasePanel() {
  const active = phaseIndex();
  return `<section class="panel"><h2>La ricostruzione</h2><div class="phase-list">${PHASES.map(([key, title], index) => {
    const cls = key === state.phase ? "active" : index < active || state.phase === "complete" ? "done" : "";
    return `<div class="phase-item ${cls}"><span class="phase-number">${index < active || state.phase === "complete" ? "✓" : `0${index + 1}`}</span>${title}</div>`;
  }).join("")}</div></section>`;
}

function historyPanel() {
  return `<section class="panel"><h2>Registro condiviso</h2><div class="history">${state.history.slice(0, 4).map((item) => `<div class="history-item"><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></div>`).join("")}</div></section>`;
}

function stationGuidance(role) {
  const guidance = {
    "1998": {
      carrier: ["PRIMO PASSO · PORTANTE", "Confronta la banda di riferimento dell’Archivio con la correzione scritta nel tuo quaderno. Parlatevi, poi regola la frequenza.", "Con il telecomando, sposta il focus con le frecce e premi Seleziona. In questa prova touch, tocca uno dei pulsanti sotto la manopola."],
      bearing: ["SECONDO PASSO · DIREZIONE", "Chiedi all’Archivio il bearing reale di Nereide. La tua bussola ha uno scarto: confrontate gli indizi e correggi la direzione.", "Dopo l’allineamento, comunicherai il ritmo degli impulsi all’Archivio."],
      reconstruction: ["TERZO PASSO · RICOSTRUZIONE", "La traccia è agganciata. Comunica all’Archivio il ritmo breve — lungo — breve e confrontate gli indizi."],
      "archive-choice": ["DECISIONE CONDIVISA", "La voce è stata recuperata. Parlate del compromesso tra rendere verificabile la prova e proteggere la baia; poi votate entrambe."],
      complete: ["SESSIONE CONCLUSA", "Avete concordato una scelta per l’archivio. Potete tornare alla schermata iniziale e azzerare la sessione per ricominciare."],
    },
    "2034": {
      carrier: ["PRIMO PASSO · PORTANTE", "Comunica alla Sala radio la banda di riferimento mostrata nell’Archivio. La correzione della console la conosce l’altra postazione."],
      bearing: ["SECONDO PASSO · DIREZIONE", "Comunica alla Sala radio il bearing reale di Nereide mostrato sulla mappa. La console analogica ha uno scarto."],
      reconstruction: ["TERZO PASSO · RICOSTRUZIONE", "Ora confronta il ritmo comunicato dalla Radio con gli intervalli dei frammenti. Seleziona una sequenza; puoi riprovare se non combacia."],
      "archive-choice": ["DECISIONE CONDIVISA", "La voce è stata recuperata. Parlate del compromesso tra rendere verificabile la prova e proteggere la baia; poi votate entrambe."],
      complete: ["SESSIONE CONCLUSA", "Avete concordato una scelta per l’archivio. Potete tornare alla schermata iniziale e azzerare la sessione per ricominciare."],
    },
  };
  const [title, message, extra] = guidance[role][state.phase] ?? guidance[role].carrier;
  return `<section class="panel station-guidance"><div class="eyebrow">${title}</div><p>${message}</p>${extra ? `<p class="guidance-extra">${extra}</p>` : ""}</section>`;
}

function phoneProxyNote() {
  return `<aside class="phone-proxy-note"><strong>Schermata TV in prova</strong>Questa pagina simula la TV della tua postazione. Tocca i pulsanti quando sono attivi: nell’Archivio si sbloccano dopo i due passaggi della Radio. Nell’esperienza finale Radio e Archivio saranno sulla TV; il telefono aprirà il companion narratore.</aside>`;
}

function archiveVotePanel(role) {
  if (state.phase !== "archive-choice" && state.phase !== "complete") return "";
  const other = role === "1998" ? "2034" : "1998";
  const otherName = other === "1998" ? "la sala radio" : "l’archivio";
  const status = state.finalChoice
    ? "Decisione condivisa da entrambe le postazioni."
    : state.votes[role] === null && state.votes[other] === null
      ? "Parlatene insieme, poi ciascuna postazione conferma la scelta."
      : state.votes[role] === null
        ? `${other === "1998" ? "La sala radio" : "L’archivio"} ha votato. Parlatene e poi conferma la tua scelta.`
      : state.votes[other] === null
        ? `Voto registrato. Aspetta la scelta di ${otherName}.`
        : state.votes[other] === state.votes[role]
          ? "I voti coincidono."
          : "I voti sono diversi: parlatevi prima di confermare.";
  return `<div class="panel" style="margin-top:20px"><h2>Decisione condivisa · confermate dopo averne parlato</h2><div class="vote-buttons"><button class="choice-button ${state.votes[role] === "publish" ? "selected" : ""}" data-vote="publish" ${state.phase === "complete" ? "disabled" : ""}><span>Pubblica registrazione + coordinate</span><small>PROVA APERTA</small></button><button class="choice-button ${state.votes[role] === "seal" ? "selected" : ""}" data-vote="seal" ${state.phase === "complete" ? "disabled" : ""}><span>Conserva la voce, sigilla le coordinate</span><small>HABITAT PROTETTO</small></button></div><p class="vote-status">${status}</p></div>`;
}

function radioActionPrompt() {
  if (state.phase === "carrier") return `<div class="action-prompt"><span>AZIONE RADIO · 1</span><strong>Regola la frequenza con i pulsanti</strong><small>Chiedi all’Archivio la banda di riferimento, poi applica la correzione del tuo quaderno. La manopola è decorativa.</small></div>`;
  if (state.phase === "bearing") return `<div class="action-prompt"><span>AZIONE RADIO · 2</span><strong>Orienta l’antenna con i pulsanti</strong><small>Chiedi all’Archivio il bearing reale di Nereide e applica lo scarto della tua bussola.</small></div>`;
  return "";
}

function archiveActionPrompt() {
  if (state.phase === "carrier") return `<div class="action-prompt waiting"><span>ARCHIVIO · IN ATTESA DELLA RADIO</span><strong>Per ora qui non c’è un comando attivo.</strong><small>Comunica alla Radio la banda di riferimento 16,8 MHz. Le sequenze si sbloccano dopo che la Radio aggancia portante e direzione.</small></div>`;
  if (state.phase === "bearing") return `<div class="action-prompt waiting"><span>ARCHIVIO · IN ATTESA DELLA RADIO</span><strong>La portante è agganciata; manca la direzione.</strong><small>Comunica alla Radio il bearing reale di Nereide mostrato sulla mappa: 067°. Le sequenze si sbloccano al prossimo passaggio.</small></div>`;
  if (state.phase === "reconstruction") return `<div class="action-prompt"><span>AZIONE ARCHIVIO</span><strong>Tocca una sequenza da confrontare</strong><small>Prima chiedi alla Radio il ritmo degli impulsi. Se la scelta non combacia, puoi riprovare.</small></div>`;
  if (state.phase === "archive-choice") return `<div class="action-prompt"><span>DECISIONE CONDIVISA</span><strong>Parlatene, poi tocca una scelta</strong><small>Ogni postazione vota dalla propria schermata. Il finale arriva solo se i voti coincidono.</small></div>`;
  return "";
}

function topbar(label = "PROTOTIPO INTERATTIVO") {
  return `<header class="topbar"><a class="wordmark" href="/${tvMode ? "?tv=1" : ""}"><span class="brand-icon">W</span>weave</a><div class="top-meta"><span><i class="live-dot"></i>sessione ${esc(state?.code ?? "NEREIDE")}</span><span>·</span><span>${label}</span></div></header>`;
}

function landing() {
  app.innerHTML = `<div class="shell">${topbar("LAB · THE LAST SIGNAL")}<main class="page landing"><div class="eyebrow">Un prototipo giocabile · sessione locale</div><h1>Due stanze.<br /><em>Un solo segnale.</em></h1><p class="lead">Una persona accorda la vecchia radio. L’altra legge un archivio che cambia in diretta. Parlatevi per ricostruire cosa è successo prima che il file venga cancellato.</p><div class="launch-grid">
    <a class="launch-card" href="/?screen=1998${tvQuery}"><span class="card-index">01 / POSTAZIONE</span><h2>La sala radio</h2><p>1998 · console analogica, bussola fuori calibrazione e una nota nel quaderno di turno.</p><span class="go">Apri vista 1998 ↗</span></a>
    <a class="launch-card archive" href="/?screen=2034${tvQuery}"><span class="card-index">02 / POSTAZIONE</span><h2>L’archivio</h2><p>2034 · spettrogramma, mappa costiera e frammenti classificati dal sistema.</p><span class="go">Apri vista 2034 ↗</span></a>
    ${tvMode ? "" : `<a class="launch-card phone" href="/?screen=phone"><span class="card-index">03 / COMPANION</span><h2>Il narratore</h2><p>Fai una domanda esplicita. Il narratore risponde entro i limiti dei fatti e del punto in cui siete arrivati.</p><span class="go">Apri companion ↗</span></a>`}
  </div><div class="notes-row"><span>${tvMode ? "Scegli la tua postazione con il telecomando. L’altra persona apre l’altro ruolo sulla sua TV. Parlatevi: ognuna vede indizi diversi." : "<strong>Demo browser:</strong> Radio e Archivio simulano le due TV: aprili su due finestre o dispositivi. Il telefono vero è il Companion. In questa prova puoi usare i telefoni come schermi temporanei; attiva l’opzione LAN nel README."}</span><button class="text-button" id="reset-session">Azzera sessione</button></div></main></div>`;
  document.querySelector("#reset-session").addEventListener("click", async () => {
    await post("/api/reset");
    toast("Sessione azzerata.");
  });
  if (tvMode && !document.activeElement?.closest("#app")) document.querySelector(".launch-card")?.focus();
}

function svgTrace() {
  const progress = state.phase === "carrier" ? Math.min(1, (state.frequency - 16) / 1.2) : 1;
  const wobble = state.phase === "carrier" ? Math.max(0, 1 - progress) : 0.12;
  const angle = (state.bearing - 67) / 4;
  const points = Array.from({ length: 48 }, (_, i) => {
    const x = 4 + i * 2.05;
    const base = 95 + Math.sin(i * 0.52 + angle) * (7 + wobble * 16) + Math.sin(i * 1.8) * wobble * 8;
    const spike = state.phase !== "carrier" && (i % 11 === 4 || i % 11 === 5) ? (i % 2 ? -30 : 29) : 0;
    return `${x.toFixed(1)},${(base + spike).toFixed(1)}`;
  }).join(" ");
  return `<svg class="trace-svg" viewBox="0 0 104 190" preserveAspectRatio="none" aria-label="Traccia del segnale aggiornata in tempo reale"><path class="trace-grid" d="M0 25H104 M0 60H104 M0 95H104 M0 130H104 M0 165H104"/><path class="trace-grid" d="M13 0V190 M39 0V190 M65 0V190 M91 0V190"/><polyline class="trace-line" points="${points}"/></svg>`;
}

function roomScene() {
  const bearingMode = state.phase === "bearing";
  const frequency = `${state.frequency.toFixed(1)}<small> MHz</small>`;
  const value = bearingMode ? `${String(state.bearing).padStart(3, "0")}<small> °</small>` : frequency;
  const label = bearingMode ? "AZIMUT ANTENNA" : state.phase === "carrier" ? "FREQUENZA RICEVITORE" : "PORTANTE AGGANCIATA";
  const controls = state.phase === "carrier"
    ? `<button class="control-button" data-control="frequency" data-delta="-0.1" aria-label="Riduci frequenza">− 0,1</button><button class="control-button" data-control="frequency" data-delta="0.1" aria-label="Aumenta frequenza">+ 0,1</button><button class="control-button" data-control="frequency" data-delta="-0.4">− 0,4</button><button class="control-button" data-control="frequency" data-delta="0.4">+ 0,4</button>`
    : state.phase === "bearing"
      ? `<button class="control-button" data-control="bearing" data-delta="-1" aria-label="Ruota antenna meno un grado">− 1°</button><button class="control-button" data-control="bearing" data-delta="1" aria-label="Ruota antenna più un grado">+ 1°</button><button class="control-button" data-control="bearing" data-delta="-4">− 4°</button><button class="control-button" data-control="bearing" data-delta="4">+ 4°</button>`
      : `<span class="dpad-note">La console è stabilizzata. L’archivio sta isolando la registrazione.</span>`;
  const clue = state.phase === "carrier" ? "+0,4 MHz" : "+4°";
  const rhythm = state.phase === "reconstruction" || state.phase === "archive-choice" || state.phase === "complete"
    ? `<p class="hint-card">Dal rumore emerge un ritmo: <strong>breve — lungo — breve</strong>. Comunicalo all’archivio.</p>`
    : "";
  return `<section class="scene"><div class="scene-header"><div><div class="eyebrow">Sala costiera · 17 ottobre 1998 · 23:41</div><h1>La radio<br />è ancora viva.</h1></div><span class="tag"><i class="live-dot"></i>OPERATRICE</span></div><div class="console-grid"><div><div class="module-label">${label}</div><div class="readout" id="readout">${value}</div>${radioActionPrompt()}<div class="control-row">${controls}</div><div class="dpad-note">Telecomando: frecce + Seleziona. Touch: tocca il pulsante (la manopola è decorativa).</div><p class="hint-card">Quaderno di turno: “La scala della console è fuori di <strong>${clue}</strong>. Verificare prima di trasmettere.”</p>${rhythm}<div class="statusline"><span class="status-mark"></span><span>${esc(state.lastResult)}</span></div></div><div class="dial-wrap"><div class="dial"><div class="dial-core">${bearingMode ? "N · E" : "TUNE"}</div></div></div></div>${archiveVotePanel("1998")}</section>`;
}

function mapGraphic() {
  const completed = state.phase !== "bearing" && state.phase !== "carrier";
  const dx = completed ? 110 : 74 + ((state.bearing - 67) / 4) * 36;
  const dy = completed ? 56 : 101 - ((state.bearing - 67) / 4) * 45;
  return `<svg class="map-graphic" viewBox="0 0 240 184" role="img" aria-label="Mappa astratta della costa e direzione del segnale"><path class="map-ocean" d="M6 8H234V176H6z"/><path class="map-coast" d="M14 25 C54 22 42 53 70 59 S77 100 109 100 124 124 151 118 167 150 220 141 M26 165 C52 134 33 116 68 109 S72 78 101 76 123 49 148 58 173 29 223 34"/><path class="map-line" d="M38 136 L${dx} ${dy}"/><circle class="map-point" cx="38" cy="136" r="5"/><circle cx="38" cy="136" r="9" fill="none" stroke="#8ee4dc" opacity=".35"/><circle class="map-point" cx="${dx}" cy="${dy}" r="4"/><text x="19" y="154" fill="#8ea9a0" font-size="8">STAZIONE</text><text x="${dx + 6}" y="${dy - 5}" fill="#8ee4dc" font-size="8">NEREIDE</text></svg>`;
}

function archiveScene() {
  const phaseTitle = state.phase === "carrier" ? "MATCH IN ATTESA" : state.phase === "bearing" ? "ALLINEAMENTO" : state.revealed ? "VOCE RECUPERATA" : "FRAMMENTI TROVATI";
  const fragmentButtons = FRAGMENTS.map((code, index) => `<button class="choice-button ${state.selectedFragments === code ? "selected" : ""}" data-fragments="${code}" ${state.phase !== "reconstruction" ? "disabled" : ""}><span>Sequenza ${String.fromCharCode(65 + index)}</span><small>${code.replaceAll("-", " · ")}</small></button>`).join("");
  const fragmentStatus = state.phase === "complete"
    ? `<p class="locked-note">Sessione conclusa. La scelta condivisa è registrata.</p>`
    : "";
  const archiveChoices = archiveVotePanel("2034");
  return `<section class="scene archive"><div class="scene-header"><div><div class="eyebrow">Archivio costiero · 17 ottobre 2034 · 23:41</div><h1>Un segnale<br />senza una voce.</h1></div><span class="tag"><i class="live-dot"></i>ANALISTA</span></div><div class="trace-box"><div class="trace-label"><span>TRACCIA / ${phaseTitle}</span><span>${state.frequency.toFixed(1)} MHz · ${String(state.bearing).padStart(3, "0")}°</span></div>${svgTrace()}<div class="trace-label"><span>RUMORE</span><span>SEGNALE</span></div></div><div class="console-grid" style="grid-template-columns:1fr 1fr; margin-top:18px; gap:18px"><div><div class="module-label">DIREZIONE REGISTRATA</div>${mapGraphic()}<p class="dpad-note">Bearing reale Nereide: <strong style="color:var(--cyan)">067°</strong>. Condividilo con la sala radio.</p></div><div><div class="module-label">INDICE FRAMMENTI · CONFRONTA CON IL RITMO DELLA RADIO</div><div class="fragment-grid">${["03", "04", "05", "08", "09", "10", "11"].map((fragment) => `<div class="fragment ${state.selectedFragments?.includes(fragment) ? "active" : ""}"><span>${fragment}</span><span>▰</span></div>`).join("")}</div>${archiveActionPrompt()}<div class="choice-list">${fragmentButtons}</div>${fragmentStatus}${archiveChoices}</div></div><div class="statusline"><span class="status-mark"></span><span>${esc(state.lastResult)}</span></div></section>`;
}

function tv(role) {
  const isRadio = role === "1998";
  const title = isRadio ? "VISTA 01 · SALA RADIO" : "VISTA 02 · ARCHIVIO";
  app.innerHTML = `<div class="shell">${topbar(title)}${tvMode ? "" : phoneProxyNote()}<main class="page"><div class="console">${isRadio ? roomScene() : archiveScene()}<aside class="side-panel">${stationGuidance(role)}${phasePanel()}<section class="panel"><h2>Il tuo indizio privato</h2><p>${isRadio ? "Scala console: +0,4 MHz. Bussola: +4° oltre il nord reale. Ritmo audio: breve — lungo — breve. Nel quaderno: «Salvate la voce. Non pubblicate il bearing»." : "Banda di riferimento: 16,8 MHz. Nereide si trova a 067° reali. Nell’archivio compaiono impulsi candidati a 03, 04, 05, 08, 09, 10 e 11."}</p></section>${historyPanel()}${tvMode ? "" : `<section class="panel"><h2>Companion</h2><p>Il narratore si usa dal telefono; invia solo le domande che scegli di fargli.</p><p style="margin-top:11px"><a class="back-link" href="/?screen=phone&role=${role}">Apri il companion ↗</a></p></section>`}</aside></div></main></div>`;
  document.querySelectorAll("[data-control]").forEach((button) => button.addEventListener("click", () => {
    const delta = Number(button.dataset.delta);
    if (button.dataset.control === "frequency") act("1998", "tune-frequency", Math.round((state.frequency + delta) * 10) / 10);
    else act("1998", "set-bearing", state.bearing + delta);
  }));
  document.querySelectorAll("[data-fragments]").forEach((button) => button.addEventListener("click", () => act("2034", "select-fragments", button.dataset.fragments)));
  document.querySelectorAll("[data-vote]").forEach((button) => button.addEventListener("click", () => act(role, "vote-archive", button.dataset.vote)));
}

function phone() {
  const selectedRole = params.get("role") === "2034" ? "2034" : "1998";
  const transcript = `<div class="bubble"><span class="speaker">Narratore · versione prototipo</span>Posso chiarire gli indizi visibili al tuo ruolo e dare suggerimenti graduati. Non rivelo l’indizio privato dell’altra postazione né anticipo la soluzione.</div>${conversation.map((item) => `<div class="bubble ${item.who === "user" ? "user" : ""}"><span class="speaker">${esc(item.speaker)}</span>${esc(item.text)}</div>`).join("")}`;
  app.innerHTML = `<div class="shell">${topbar("COMPANION · NARRATORE")}<main class="mobile-wrap"><section class="phone-card"><div class="eyebrow">Sessione NEREIDE · richiesta esplicita</div><h1>Chiedi al<br /><em style="color:#d1a8ff;font-style:normal">narratore.</em></h1><p class="lead">La conversazione tra voi resta privata. Solo ciò che scrivi qui viene inviato al narratore.</p><div class="role-picker"><button data-role="1998" aria-pressed="${selectedRole === "1998"}">Sono alla RADIO · 1998</button><button data-role="2034" aria-pressed="${selectedRole === "2034"}">Sono in ARCHIVIO · 2034</button></div><div class="chat-log" id="chat-log">${transcript}</div><form class="ask-row" id="ask-form"><input id="question" autocomplete="off" placeholder="Es. cosa dovremmo confrontare?" aria-label="Scrivi una domanda al narratore" /><button type="submit">CHIEDI ↗</button></form><div class="prompt-chips"><button data-prompt="Sono bloccata, mi dai un suggerimento?">Mi dai un suggerimento?</button><button data-prompt="È davvero un SOS?">È davvero un SOS?</button><button data-prompt="Cosa vede l’altra persona?">Cosa vede l’altra?</button></div><p class="disclaimer">Prototipo locale: il narratore qui usa regole verificabili, non un modello generativo. Le risposte non cambiano lo stato del gioco.</p></section></main></div>`;
  let role = selectedRole;
  document.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", () => {
    role = button.dataset.role;
    params.set("role", role);
    history.replaceState({}, "", `${location.pathname}?${params}`);
    document.querySelectorAll("[data-role]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice.dataset.role === role)));
  }));
  document.querySelectorAll("[data-prompt]").forEach((button) => button.addEventListener("click", () => sendQuestion(button.dataset.prompt, role)));
  document.querySelector("#ask-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#question");
    if (input.value.trim()) sendQuestion(input.value.trim(), role);
    input.value = "";
  });
}

async function sendQuestion(question, role) {
  const log = document.querySelector("#chat-log");
  conversation.push({ who: "user", speaker: `Tu · ${role === "1998" ? "Radio 1998" : "Archivio 2034"}`, text: question });
  const answer = { who: "assistant", speaker: "Narratore · consulta il registro", text: "Il narratore consulta il registro…" };
  conversation.push(answer);
  log.innerHTML = `<div class="bubble"><span class="speaker">Narratore · versione prototipo</span>Posso chiarire gli indizi visibili al tuo ruolo e dare suggerimenti graduati. Non rivelo l’indizio privato dell’altra postazione né anticipo la soluzione.</div>${conversation.map((item) => `<div class="bubble ${item.who === "user" ? "user" : ""}"><span class="speaker">${esc(item.speaker)}</span>${esc(item.text)}</div>`).join("")}`;
  log.scrollTop = log.scrollHeight;
  try {
    const response = await post("/api/narrator", { question, role });
    answer.speaker = response.mode === "local-ai" ? "Narratore · AI locale" : "Narratore · regole sicure";
    answer.text = response.answer;
  } catch (error) {
    answer.text = error.message;
  }
  const refreshedLog = document.querySelector("#chat-log");
  if (refreshedLog) {
    refreshedLog.innerHTML = `<div class="bubble"><span class="speaker">Narratore · versione prototipo</span>Posso chiarire gli indizi visibili al tuo ruolo e dare suggerimenti graduati. Non rivelo l’indizio privato dell’altra postazione né anticipo la soluzione.</div>${conversation.map((item) => `<div class="bubble ${item.who === "user" ? "user" : ""}"><span class="speaker">${esc(item.speaker)}</span>${esc(item.text)}</div>`).join("")}`;
    refreshedLog.scrollTop = refreshedLog.scrollHeight;
  }
}

function currentFocusTarget() {
  const active = document.activeElement;
  if (!active || active === document.body) return null;
  if (active.dataset.control) return { type: "control", control: active.dataset.control, delta: active.dataset.delta };
  if (active.dataset.fragments) return { type: "fragments", value: active.dataset.fragments };
  if (active.dataset.vote) return { type: "vote", value: active.dataset.vote };
  if (active.id) return { type: "id", value: active.id };
  if (active.tagName === "A") return { type: "link", value: active.getAttribute("href") };
  return null;
}

function restoreFocus(target) {
  if (!target) return;
  let element;
  if (target.type === "control") element = document.querySelector(`[data-control="${target.control}"][data-delta="${target.delta}"]`);
  else if (target.type === "fragments") element = document.querySelector(`[data-fragments="${target.value}"]`);
  else if (target.type === "vote") element = document.querySelector(`[data-vote="${target.value}"]`);
  else if (target.type === "id") element = document.getElementById(target.value);
  else if (target.type === "link") element = [...document.querySelectorAll("a[href]")].find((link) => link.getAttribute("href") === target.value);
  if (!element || element.disabled) element = document.querySelector(".scene [data-control]:not(:disabled), .scene [data-fragments]:not(:disabled), .scene [data-vote]:not(:disabled)");
  element?.focus({ preventScroll: true });
}

function render() {
  if (!state) return;
  const focusTarget = currentFocusTarget();
  if (screen === "1998" || screen === "2034") tv(screen);
  else if (screen === "phone") phone();
  else landing();
  restoreFocus(focusTarget);
  if (tvMode && !focusTarget && (screen === "1998" || screen === "2034")) {
    document.querySelector(".scene [data-control]:not(:disabled), .scene [data-fragments]:not(:disabled), .scene [data-vote]:not(:disabled)")?.focus({ preventScroll: true });
  }
}

async function start() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    state = await response.json();
    render();
    const events = new EventSource("/api/events");
    events.onmessage = (event) => {
      const incoming = JSON.parse(event.data);
      if (state && incoming.generation !== state.generation) conversation = [];
      state = incoming;
      render();
    };
    events.onerror = () => toast("Connessione in ripristino…");
  } catch {
    app.innerHTML = `<div class="shell"><main class="page"><h1>Il server non risponde.</h1><p class="lead">Avvia il prototipo con <code>npm start</code>, poi ricarica questa pagina.</p></main></div>`;
  }
}

start();
