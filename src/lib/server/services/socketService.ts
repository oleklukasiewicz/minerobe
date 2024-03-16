import WebSocket, { WebSocketServer } from "ws";
export const socketServer = new WebSocketServer({ port: 5128 });

export const configureServerSocket = () => {
  socketServer.on("connection", (ws) => {
    let userId;
    sockets[userId] = ws;

    ws.on("message", function incoming(message) {
      const msg = JSON.parse(message);
      if (msg.type === "join") {
        userId = msg.userId;
        sockets[userId] = ws;
      }
    });

    ws.on("close", function incoming(message) {
      delete sockets[userId];
    });
  });
};
const sockets = {};

export function socketTo(user, data) {
  if (sockets[user] && sockets[user].readyState === WebSocket.OPEN)
    sockets[user].send(JSON.stringify(data));
}
