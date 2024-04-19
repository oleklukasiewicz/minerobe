import { FetchSettings } from "$src/api/settings";
import { get } from "svelte/store";
import { page } from "$app/stores";
import { userSettings } from "./cache";
import ioClient from "socket.io-client";

export const configureSocket = (userId) => {
  console.log("Connecting to server", import.meta.env.VITE_IS_DEV);
  const io = ioClient(
    get(page).url.hostname + (import.meta.env.VITE_IS_DEV==true ? ":4173" : "")
  );
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
