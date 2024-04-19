import { FetchSettings } from "$src/api/settings";
import { get } from "svelte/store";
import { page } from "$app/stores";
import { userSettings } from "./cache";
import ioClient from "socket.io-client";

export const configureSocket = (userId) => {
  const io = ioClient("http://localhost:4173");
  io.on("connect", () => {
    console.log("Connected to server");
    io.emit("join", userId);
  });
  io.on("authFinished", async () => {
    console.log("Auth finished");
    const sets = await FetchSettings(userId);
    userSettings.set(sets);
  });
};
