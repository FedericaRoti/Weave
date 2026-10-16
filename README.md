# Weave: The Last Signal

Weave is a two-player cooperative mystery for Fire TV. One player operates a coastal radio station in 1998; the other investigates the same signal in a 2034 archive. They see different clues, talk to each other, and watch a change on one screen alter the other. This repository contains a playable vertical slice and a Vega OS WebView shell.

The story ends with a shared decision: publish a recovered recording with its precise coordinates, or preserve the recording while sealing the location. Neither outcome is declared correct.

## What works today

- Two asymmetric TV roles, three linked reconstruction steps, a reveal, and a two-vote ending.
- One authoritative Node.js game state, synchronized to all connected screens using Server-Sent Events.
- A separate phone companion. Players send only deliberate questions; their human conversation is never captured by the app.
- An optional local AI narrator that interprets free-form questions by selecting from role- and phase-allowed facts. The server constructs the response from those facts, so the model cannot add its own story details. A deterministic narrator remains available when the local model is off or unavailable.
- A Vega OS app that loads the TV interface in a WebView. The app has been built, installed, and launched on Vega Virtual Device; the final visual/D-pad acceptance check is still pending.

This is a hackathon demo, not an Appstore-ready product. It currently uses one local session server; remote matchmaking, production authentication, integrated voice calling, and automatic phone pairing are not implemented.

## Requirements

- Node.js 20+ and npm.
- For the TV shell: [Amazon Vega SDK and Vega Virtual Device](https://developer.amazon.com/docs/vega/0.24/run-apps).
- Optional AI: a local Ollama server with `qwen3:4b-instruct-2507-q4_K_M` available, or set `WEAVE_OLLAMA_MODEL` to another local instruct model. No cloud API key is required.

## Run the game in a browser

From the repository root:

```sh
npm start
```

Open `http://localhost:4173/?screen=1998` and `http://localhost:4173/?screen=2034` in separate windows. Open `http://localhost:4173/?screen=phone` for the narrator. To exercise the TV layout in a desktop browser, add `&tv=1` to either role URL (or open `http://localhost:4173/?tv=1`).

For the optional local AI narrator, start the server with `WEAVE_NARRATOR=ollama npm start`. The companion labels a response “AI locale” only when the local model actually supplied valid fact IDs; otherwise it labels the rules fallback. Questions and game facts are sent to `127.0.0.1:11434`, not to AWS or another cloud service.

To enable it, install [Ollama](https://ollama.com/download), make sure its local server is running, and download the model once:

```sh
ollama pull qwen3:4b-instruct-2507-q4_K_M
WEAVE_NARRATOR=ollama npm start
```

The model download is about 2.5 GB. On macOS, launching the Ollama app starts its local server; on other setups, start it with `ollama serve` in a separate terminal. If Ollama or the model is unavailable, Weave uses the deterministic rules narrator and the game remains playable. No API key or cloud account is needed.

## Run the Vega OS app in the simulator

1. Start the Node server from the repository root in one terminal and leave it running.
2. Start Vega Virtual Device in another terminal: `vega virtual-device start --timeout 120`. Leave this terminal open while testing.
3. Map the simulator's localhost to the host server: `vega exec vda reverse tcp:4173 tcp:4173`.
4. Install dependencies and build the TV shell from the repository root:

```sh
npm --prefix tv ci
PATH="$HOME/vega/bin:$PATH" npm --prefix tv run build:debug
```

5. On an Apple Silicon Mac, install and launch the generated aarch64 package:

```sh
vega run-app tv/build/private/kepler/@amazon-devices/weave/undefined/vega/aarch64/Debug/@amazon-devices/weave_aarch64.vpkg com.federicaroti.weave.main --deviceId VirtualDevice
```

The app opens the TV role selector. Choose Radio or Archive with the D-pad and Select. A second browser window can stand in for the other TV in a single-simulator demonstration. The browser companion remains a separate surface. If the app shows a connection error, verify that the Node server is running and repeat the `vda reverse` command, then choose Retry.

The hard-coded `localhost:4173` URL and VDA reverse are development wiring, not a deployable remote backend. Do not present this build as supporting two internet-separated homes yet.

## Full demo path

1. In Archive, read the reference band, **16.8 MHz**, and tell Radio. Radio combines it with its private **+0.4 MHz** calibration and tunes from **16.0** to **17.2 MHz**.
2. Archive tells Radio that Nereide is at **067° true**. Radio applies its private **+4°** compass offset and sets **071°**.
3. Radio shares the short–long–short pulse rhythm. Archive selects sequence **A, 03–04–09–10**. The recovered audio is revealed to be whale vocalization rather than an SOS.
4. Both roles discuss whether to publish or seal the location and vote for the same option. The ending appears only after matching votes.

The frequency buttons move by 0.1 or 0.4 MHz; the bearing buttons move by 1° or 4°. On TV, use arrow keys to move focus and Select to activate. The dial graphic is decorative. The home page has a Reset Session action.

## Tests

```sh
npm test
npm --prefix tv test
npm --prefix tv run lint
cd tv && ./node_modules/.bin/tsc --noEmit
```

## Architecture and privacy

`server.js` serves the browser surfaces and API. `src/game.js` owns the canonical state and enforces role-specific actions. `src/narrator.js` builds a list of accessible facts for the current role and phase; the optional local model selects fact IDs, and invalid IDs fall back to deterministic rules. `public/` is the responsive UI. `tv/` is the Vega React Native shell with a WebView.

The local server binds to `127.0.0.1` by default. A LAN test can opt in with `WEAVE_HOST=0.0.0.0 npm start`, but there is no authentication or rate limiting: use only a trusted network and never expose this server directly to the public internet. All clients connected to one process share a single in-memory session. Restarting the process erases it. No telemetry is added by Weave; the Vega toolchain has its own settings outside this project.

## Hackathon submission status

This repository is being prepared for the [Build, Ship, Shape Amazon Developer Hackathon](https://amazonappdev2026.devpost.com/rules), Fire TV track. The rules require a working Vega/Fire OS demo shown on an actual device or simulator, a public YouTube/Vimeo video under three minutes, an accessible GitHub repository, English submission material, and product feedback. See [submission draft](docs/SUBMISSION.md) and [roadmap](docs/ROADMAP.md). A successful local build or browser demo alone is not a submitted entry.
