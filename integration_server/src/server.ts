import express from "express";
import { TwitchClient } from "./twitch.client.js";
import { createServer } from "node:http"
import { WebSocketServer } from "ws";
import { ObsClient } from "./obs.client.js";
import { getSecrets } from "./secrets.js";
import { exit } from "node:process";
import { program } from "commander";

const command = program.option("-s, --secrets-path <path>", "The path to the secrets file.", "secrets.json");

const opts = command.parse()
    .opts<{ secretsPath: string }>()

const secrets = getSecrets(opts.secretsPath);
if (!secrets) exit(1);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/wss" });
const twitchClient = new TwitchClient(secrets);
const obsClient = new ObsClient(secrets);

wss.on("connection", (ws) => {
    console.log("A WebSocket connected");
    twitchClient.on("event", e => ws.send(JSON.stringify(e)));
    twitchClient.sendBadges();
    obsClient.on("event", e => ws.send(JSON.stringify(e)));
});

app.get("/wss");

app.use(express.static('overlays'))

const port = 8080;
server.listen({ port }, () => {
    console.log("Server running on:", port);
});