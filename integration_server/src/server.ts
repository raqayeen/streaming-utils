import secrets from "../../secrets.json" with { type: "json" };
import express from "express";
import { TwitchClient } from "./twitch.client.js";
import { createServer } from "node:http"
import { WebSocketServer } from "ws";
import { ObsClient } from "./obs.client.js";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/wss" });
const twitchClient = new TwitchClient(secrets);
const obsClient = new ObsClient();

wss.on("connection", (ws) => {
    console.log("A WebSocket connected");
    try {
        twitchClient.on("event", e => ws.send(JSON.stringify(e)));
        twitchClient.sendBadges();
        obsClient.on("event", e => ws.send(JSON.stringify(e)));
    } catch (err) {
        console.error(err);
    }
    // ws.on('open', () => {
    //     console.log("A WebSocket opened");
    // });
});

app.get("/wss");

const port = 8080;
server.listen({ port }, () => {
    console.log("Server running on:", port);
});