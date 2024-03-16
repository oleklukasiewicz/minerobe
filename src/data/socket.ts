import { FetchSettings } from "$src/api/settings";
import { get } from "svelte/store";
import { currentUser, userSettings } from "./cache";
import { page } from "$app/stores";

export let socket;

export const configureSocket = (userId) => {
  console.log("Configuring socket");
  socket = new WebSocket("wss://"+get(page).url.hostname+":5128");
  socket.onopen = function (event) {
    console.log("Socket opened");
    socket.send(JSON.stringify({ type: "join", userId: userId }));
  };

  socket.onmessage = async function (event) {
    const msg = JSON.parse(event.data);
    if (msg.type == "authFinished") {
      console.log("Auth finished");
      const sets = await FetchSettings(get(currentUser).id);
      userSettings.set(sets);
    }
  };
};
