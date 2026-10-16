# Devpost submission draft — Weave: The Last Signal

Status: **draft, not submitted**. Replace the bracketed URLs only after the real repository and public video have been verified. Submit to the **Fire TV primary track**. Do not select AWS Builder: no AWS runtime service is used. Do not select Open Source Mini Challenge unless a separate qualifying contribution exists.

## Project description

What if two living rooms were different perspectives on one mystery? Weave is a cooperative Fire TV experience in which one player operates a coastal radio station in 1998 and the other investigates its archived signal in 2034. Each screen holds information the other lacks. The players have to talk, adjust a frequency and antenna bearing, reconstruct damaged fragments, then agree on what should become public.

The demo case, *The Last Signal*, begins with a recording classified as an SOS. Reconstructing it reveals that the classification was wrong, but also exposes the precise location of a fragile whale breeding area. The finale asks both players to choose between publishing the coordinates as verifiable evidence or sealing them to protect the habitat. The ending is committed only when their votes match.

The TV experience runs in a Vega OS WebView app. A Node.js server owns the game state and streams each valid action to both perspectives. A separate phone companion accepts deliberate questions; the players' own call is not recorded or sent to the narrator. An optional local language model interprets free-form questions by choosing only facts already available to the current role and story phase. The server assembles the answer from those exact facts, with a deterministic fallback when the model is absent or its selection is invalid. We do not use AWS or a paid API.

This is a complete playable vertical slice, not a production multiplayer service. The current demo uses a local shared server and does not yet offer internet matchmaking, integrated voice, or automatic QR pairing.

## Links to fill

- Source code: `[GitHub repository URL]`
- Repository access: private; invite `chris-trag`, `knmeiss`, `giolaq`, `anishamalde`, `mosesroth`, and `emersonsklar` as collaborators, as specified in the [official rules](https://amazonappdev2026.devpost.com/rules).
- Demo video, public on YouTube or Vimeo and under 3 minutes: `[video URL]`
- Primary track: Fire TV
- Mini-challenges: None unless separately qualified

## How to test

Follow the [English README](../README.md) for the Node server, Vega build, VDA reverse, simulator installation, and full demo path. The simulator can host one TV role while a second browser window stands in for the other role. The phone companion opens separately in a browser. No accounts, secrets, or cloud services are needed for the deterministic demo; Ollama is optional.

## Product feedback required by Devpost

**Tools used and purpose.** Vega SDK/CLI 0.24, Vega Virtual Device, React Native Kepler WebView, and VDA were used to package, launch, and test the TV client. Node.js powers the local authoritative game server. Ollama is an optional local model for question interpretation, not an Amazon service.

**What worked well.** The official WebView template offered a fast route from an existing browser prototype to a Vega app. The CLI built architecture-specific packages, `vega run-app` installed and launched the aarch64 build, and VDA reverse let the simulator reach the local game server. The simulator was sufficient to begin target-platform testing without buying hardware.

**What needs work.** The Virtual Device initially reported “ready” and then disappeared from `status` when the launching shell ended. Keeping the launching terminal open made it remain available in this environment. The CLI also logged a `vvman` fallback warning while still starting successfully. The official `gwsi-tool-screenshooter` command does not support the Virtual Device, complicating automated visual verification. We still need to verify D-pad behavior in the actual simulator window.

**Onboarding from zero to hello world.** SDK installation required a retry after a network/CDN reset. The WebView project generated and built; the first build needed Vega on `PATH` and permission to create SDK workspace links. The app installed and launched once the virtual device stayed running and VDA reverse was set.

**Would we build with Vega again?** Yes, for TV-first interactions that benefit from D-pad focus and a living-room screen. Better headless simulator capture and clearer lifecycle diagnostics would improve the feedback loop.

## Optional friction log

1. **Virtual Device lifecycle — high.** Attempt: start with `vega virtual-device start --timeout 120`. Expected: `status` remains running after “ready.” Actual: in this tool-run environment, the instance sometimes ended as the launching shell closed. Workaround: keep the launching terminal alive. Suggestion: document lifecycle behavior and report whether the child process exited, including its reason.
2. **Simulator screenshot — medium.** Attempt: use `gwsi-tool-screenshooter` through VDA. Expected: PNG output for visual QA. Actual: Virtual Device does not support it, as the docs note. Suggestion: provide a supported CLI screenshot or video capture path for VVD.
3. **Local server bridge — low.** Attempt: load a development HTTP server from the WebView. Expected: loopback access. Actual: requires explicit cleartext `localhost` permission in the manifest and VDA reverse mapping. Suggestion: include this exact WebView + local server example in the quickstart.

## Video outline (target 2:30–2:45)

All footage of the TV role should show the **Vega Virtual Device window**. The second role and phone companion may appear as adjacent browser windows; label them accurately. Add English voice-over or English captions for the Italian in-app copy.

1. **0:00–0:20 — The premise.** “Two players, two decades, one signal. On Vega Fire TV, each player sees only half the mystery.” Show the Vega app role selector and choose Radio.
2. **0:20–0:55 — Asymmetric clues.** Show Radio's calibration and Archive's reference band. Tell viewers that the players speak directly and the app does not listen to their conversation.
3. **0:55–1:25 — A visible consequence.** Tune Radio to 17.2 MHz and show Archive's trace changing; then align the bearing to 071° and show fragments unlock.
4. **1:25–1:55 — The reveal.** Exchange the pulse rhythm, select the matching fragment sequence in Archive, and show the false-SOS reveal.
5. **1:55–2:20 — The narrator and decision.** Ask a free-form question in the phone companion; show the local-AI/fallback label honestly. Both players vote to seal or publish the coordinates; show the result.
6. **2:20–2:40 — Why this matters.** “Weave turns the TV into a shared place to cooperate, not a passive screen. The engine and fact boundaries can support other short stories.” End with project name and repository URL.

Before publishing, confirm that the video truly shows the app running on Vega, has no third-party music or unlicensed material, and is under three minutes. Final Devpost submission is a separate action because it accepts the official rules.
