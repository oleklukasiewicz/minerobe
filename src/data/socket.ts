import { FetchSettings } from "$src/api/settings";
import { get } from "svelte/store";
import { page } from "$app/stores";
import ioClient from "socket.io-client";
import { serverConfig, sharedConfig } from "./config";

export let socket = null; 

export const configureSocket = (userId) => {
  console.log("Connecting to socket server");
  const io = ioClient(
    get(page).url.hostname + (sharedConfig.dev
      ? (":" + serverConfig.socketConfig.port)
      : "")
  );
  socket = io;
  io.on("connect", () => {
    console.log("Connected to server");
    io.emit("join", userId);
  });
  io.on("linkFinished", async () => {
    console.log("Auth finished");
    const sets = await FetchSettings(userId);
  });
};