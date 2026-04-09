import express from "express";
import matchesRouter from "./routes/matches.js";
import http from 'http'
import { attachWebSocketServer } from "./socket/server.js";
const app = express();
const server = http.createServer(app);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "SpeedySport API is running." });
});
app.use("/matches", matchesRouter);

const {broadcastMatchCreated} = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";
server.listen(PORT, HOST, () => {
    const baseURL = HOST === '0.0.0.0' ? 'http://localhost' : `http://${HOST}`;
    console.log(`Server listening at ${baseURL}:${PORT}`);
    console.log(`WebSocket server listening at ${baseURL.replace('http', 'ws')}:${PORT}/ws`);
});