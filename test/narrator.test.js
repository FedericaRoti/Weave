import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/game.js";
import { answerWithLocalModel } from "../src/narrator.js";

test("il narratore locale riceve solo i fatti del ruolo corrente", async () => {
  const previous = process.env.WEAVE_NARRATOR;
  process.env.WEAVE_NARRATOR = "ollama";
  let sentPrompt = "";
  try {
    const outcome = await answerWithLocalModel({
      question: "Che cosa sappiamo?",
      role: "1998",
      state: createGameStore().getState(),
      fetchImpl: async (_url, request) => {
        sentPrompt = JSON.parse(request.body).prompt;
        return { ok: true, json: async () => ({ response: JSON.stringify({ fact_ids: [2] }) }) };
      },
    });
    assert.equal(outcome.mode, "local-ai");
    assert.match(sentPrompt, /\+0,4 MHz/);
    assert.doesNotMatch(sentPrompt, /16,8 MHz|067 gradi|vocalizzazione di balene/);
  } finally {
    if (previous === undefined) delete process.env.WEAVE_NARRATOR;
    else process.env.WEAVE_NARRATOR = previous;
  }
});

test("ID non autorizzati del modello ricadono sulle regole", async () => {
  const previous = process.env.WEAVE_NARRATOR;
  process.env.WEAVE_NARRATOR = "ollama";
  try {
    const outcome = await answerWithLocalModel({
      question: "È un SOS?",
      role: "2034",
      state: createGameStore().getState(),
      fetchImpl: async () => ({ ok: true, json: async () => ({ response: JSON.stringify({ fact_ids: [99] }) }) }),
    });
    assert.equal(outcome.mode, "rules");
    assert.match(outcome.answer, /etichetta SOS/);
  } finally {
    if (previous === undefined) delete process.env.WEAVE_NARRATOR;
    else process.env.WEAVE_NARRATOR = previous;
  }
});

test("se il modello non è raggiungibile rimane il narratore sicuro", async () => {
  const previous = process.env.WEAVE_NARRATOR;
  process.env.WEAVE_NARRATOR = "ollama";
  try {
    const outcome = await answerWithLocalModel({
      question: "Non so cosa fare",
      role: "1998",
      state: createGameStore().getState(),
      fetchImpl: async () => { throw new Error("offline"); },
    });
    assert.equal(outcome.mode, "rules");
    assert.match(outcome.answer, /Confrontate la banda/);
  } finally {
    if (previous === undefined) delete process.env.WEAVE_NARRATOR;
    else process.env.WEAVE_NARRATOR = previous;
  }
});
