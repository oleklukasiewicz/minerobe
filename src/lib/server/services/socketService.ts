import { serverConfig, sharedConfig } from "$src/data/config";
import { createServer } from "http";
import { Server } from "socket.io";
const httpServer = createServer();
export const socketServer = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
httpServer.listen(serverConfig.socketConfig.port, () => {
  console.log(
    "Socket server running on port " +
      serverConfig.socketConfig.port +
      ": dev? " +
      sharedConfig.dev
  );
});

export const configureSocketServer = () => {
  socketServer.on("connection", (socket) => {
    console.log("Socket connected");
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
    socket.on("join", (data) => {
      socket.join(data);
      console.log("Socket joined room " + data);
    });
  });
};
