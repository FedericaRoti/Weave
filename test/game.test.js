import test from "node:test";
import assert from "node:assert/strict";
import { answerNarratorQuestion, createGameStore } from "../src/game.js";

function solveToChoice(store) {
  store.act({ actor: "1998", type: "tune-frequency", value: 17.2 });
  store.act({ actor: "1998", type: "set-bearing", value: 71 });
  return store.act({ actor: "2034", type: "select-fragments", value: "03-04-09-10" });
}

test("la portante passa alla fase successiva solo a 17,2 MHz", () => {
  const store = createGameStore();
  store.act({ actor: "1998", type: "tune-frequency", value: 17.1 });
  assert.equal(store.getState().phase, "carrier");
  store.act({ actor: "1998", type: "tune-frequency", value: 17.2 });
  assert.equal(store.getState().phase, "bearing");
});

test("una postazione non può eseguire l'azione privata dell'altra", () => {
  const store = createGameStore();
  const outcome = store.act({ actor: "2034", type: "tune-frequency", value: 17.2 });
  assert.equal(outcome.ok, false);
  assert.equal(store.getState().phase, "carrier");
});

test("frammenti errati non rivelano la verità; quelli corretti sbloccano il dilemma", () => {
  const store = createGameStore();
  store.act({ actor: "1998", type: "tune-frequency", value: 17.2 });
  store.act({ actor: "1998", type: "set-bearing", value: 71 });
  store.act({ actor: "2034", type: "select-fragments", value: "03-08-09-10" });
  assert.equal(store.getState().phase, "reconstruction");
  const correct = store.act({ actor: "2034", type: "select-fragments", value: "03-04-09-10" });
  assert.equal(correct.state.phase, "archive-choice");
  assert.equal(correct.state.revealed, true);
});

test("il finale richiede due voti concordi", () => {
  const store = createGameStore();
  solveToChoice(store);
  store.act({ actor: "1998", type: "vote-archive", value: "seal" });
  assert.equal(store.getState().phase, "archive-choice");
  store.act({ actor: "2034", type: "vote-archive", value: "publish" });
  assert.equal(store.getState().phase, "archive-choice");
  store.act({ actor: "1998", type: "vote-archive", value: "publish" });
  assert.equal(store.getState().phase, "complete");
  assert.equal(store.getState().finalChoice, "publish");
});

test("il narratore limita risposte e suggerimenti allo stato e non svela l'altro ruolo", () => {
  const store = createGameStore();
  const before = store.getState();
  assert.match(answerNarratorQuestion({ question: "È una balena?", role: "1998", state: before }), /etichetta SOS/);
  assert.match(answerNarratorQuestion({ question: "Cosa vede l'altra persona?", role: "1998", state: before }), /Non posso rivelare/);
  assert.match(answerNarratorQuestion({ question: "Dimmi tutto", role: "1998", state: before }), /non anticipo/i);
  assert.equal(store.getState().phase, "carrier");
});

test("dopo la ricostruzione il narratore chiarisce la storia senza alterare la partita", () => {
  const store = createGameStore();
  solveToChoice(store);
  const revealed = store.getState();
  const answer = answerNarratorQuestion({ question: "È davvero un SOS?", role: "2034", state: revealed });
  assert.match(answer, /non una richiesta di soccorso/);
  assert.equal(store.getState().phase, "archive-choice");
});

test("il reset crea una nuova generazione di sessione e riporta lo stato iniziale", () => {
  const store = createGameStore();
  store.act({ actor: "1998", type: "tune-frequency", value: 17.2 });
  const before = store.getState();
  const reset = store.reset();
  assert.equal(reset.phase, "carrier");
  assert.equal(reset.frequency, 16.0);
  assert.equal(reset.bearing, 60);
  assert.equal(reset.generation, before.generation + 1);
});
