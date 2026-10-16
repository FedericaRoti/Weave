# Portfolio case study — Weave

## The challenge

Design a Fire TV experience for two people in different places that makes the TV essential to collaboration rather than using it as a large phone screen. Make a hackathon vertical slice that also demonstrates product thinking, architecture, interaction design, and verification.

## The concept

Two players work on one signal across two eras. The 1998 Radio player controls the source; the 2034 Archive player sees how each action changes the stored trace and holds complementary data. The goal is not to guess an answer alone, but to communicate enough to reconstruct a recording and make a shared ethical decision.

## Design decisions

- Distinct visual languages: warm analog radio and cool digital archive.
- D-pad-friendly TV controls with explicit focus and action buttons; the decorative dial is not a hidden interaction.
- A phone companion for deliberate narrator questions; human speech is not silently collected.
- A single authoritative game engine instead of allowing the narrator model to mutate state.
- A local AI boundary: the model selects accessible fact IDs, and the server renders only canonical facts. Invalid output falls back to deterministic rules.
- A scoped vertical slice: one complete case with two endings, rather than several unfinished cases or an untested cloud stack.

## Implementation

Node.js HTTP server + SSE for shared state; rule-checked actions and voting in `src/game.js`; role/phase-specific fact selection in `src/narrator.js`; responsive web scenes in `public/`; Vega React Native WebView shell in `tv/`.

## Evidence so far

- Ten engine/narrator tests pass.
- The Vega aarch64 package builds, installs, and launches in Vega Virtual Device. The simulator reports the app as visible and its WebView renderer as ready; its localhost can reach the game server through VDA reverse.
- A browser-based two-role playthrough verified synchronization, all three puzzles, and the matching-vote ending.

## Honest limits and next validation

The visible simulator window and D-pad have not yet passed a hands-on acceptance test. The current local server does not connect two internet-separated homes. The AI is optional, local, and constrained; it is not an unconstrained storyteller. Two-person unprompted playtesting is still needed to judge comprehension and emotional payoff. These are explicit next steps, not claimed outcomes.

## Reuse beyond the case

Weave is a narrative engine for asymmetric scenes: a new case can replace the canonical facts, role clues, phase transitions, and visual theme without changing the basic cooperation model. That is the portfolio value beyond a single hackathon story.
