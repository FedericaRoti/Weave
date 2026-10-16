import http from "node:http";
import os from "node:os";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createGameStore } from "./src/game.js";
import { answerWithLocalModel } from "./src/narrator.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 16_384) throw new Error("Request too large");
  }
  return JSON.parse(raw || "{}");
}

export function createAppServer(store = createGameStore()) {
  const clients = new Set();
  const unsubscribe = store.subscribe((state) => {
    for (const response of clients) response.write(`data: ${JSON.stringify(state)}\n\n`);
  });

  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");

    if (request.method === "GET" && url.pathname === "/api/state") return sendJson(response, 200, store.getState());
    if (request.method === "GET" && url.pathname === "/api/events") {
      response.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
      response.write(`data: ${JSON.stringify(store.getState())}\n\n`);
      clients.add(response);
      const heartbeat = setInterval(() => response.write(": ping\n\n"), 20_000);
      request.on("close", () => {
        clearInterval(heartbeat);
        clients.delete(response);
      });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/action") {
      try {
        const input = await readJson(request);
        const outcome = store.act(input);
        return sendJson(response, outcome.ok ? 200 : 400, outcome);
      } catch (error) {
        return sendJson(response, 400, { ok: false, message: error.message });
      }
    }
    if (request.method === "POST" && url.pathname === "/api/narrator") {
      try {
        const input = await readJson(request);
        const outcome = await answerWithLocalModel({ ...input, state: store.getState() });
        return sendJson(response, 200, outcome);
      } catch (error) {
        return sendJson(response, 400, { answer: "Non riesco a leggere questa domanda." });
      }
    }
    if (request.method === "POST" && url.pathname === "/api/reset") return sendJson(response, 200, store.reset());

    if (request.method !== "GET") return sendJson(response, 404, { error: "Not found" });
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const resolved = path.resolve(PUBLIC, `.${requested}`);
    if (!resolved.startsWith(PUBLIC + path.sep)) return sendJson(response, 403, { error: "Forbidden" });
    try {
      const body = await readFile(resolved);
      response.writeHead(200, { "Content-Type": MIME[path.extname(resolved)] ?? "application/octet-stream", "Cache-Control": "no-cache" });
      return response.end(body);
    } catch {
      return sendJson(response, 404, { error: "Not found" });
    }
  });

  server.on("close", unsubscribe);
  return server;
}

function localAddresses() {
  const addresses = [];
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const entry of interfaces ?? []) if (entry.family === "IPv4" && !entry.internal) addresses.push(entry.address);
  }
  return addresses;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT ?? 4173);
  const host = process.env.WEAVE_HOST ?? "127.0.0.1";
  const server = createAppServer();
  server.listen(port, host, () => {
    console.log(`Weave prototype: http://localhost:${port}`);
    if (host !== "127.0.0.1" && host !== "localhost") {
      for (const address of localAddresses()) console.log(`Altri dispositivi sulla stessa rete: http://${address}:${port}`);
      console.log("Accesso LAN senza login: usa solo una rete fidata e non esporre su Internet.");
    }
  });
}
