import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;

        sendJson(client, payload);
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 1024 * 1024 });

    wss.on("connection", async (socket, req) => {

        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req)
                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? 'Rate limit exceeded' : 'Forbidden';
                    socket.close(code, reason)
                    return
                }
            } catch (error) {
                console.error('WS connection error:', error)
                socket.close(1011, 'Internal error')
                return
            }
        }

        socket.isAlive = true
        sendJson(socket, { type: "welcome", message: "Welcome to the server" });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
        })

        socket.on("pong", () => {
            socket.isAlive = true;
        })
    });

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: "matchCreated", data: match });
    }

    return { broadcastMatchCreated };
}