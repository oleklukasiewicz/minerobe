import { Server } from "socket.io";
import express from "express";
import http from "http";
const app = express();
const httpsServer = http.createServer(app);
export const socketServer = new Server(httpsServer, {
  cors: {
    origin: "*",
  },
});
httpsServer.listen(5128, () => {
  console.log("Socket server listening on *:5128");
});
