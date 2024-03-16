import { FetchSettings } from "$src/api/settings";
import { get } from "svelte/store";
import { currentUser, userSettings } from "./cache";
import Pusher from "pusher-js";

//export let pusher;

export const configureSocket = (userId) => {
  var pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  });
  var channel = pusher.subscribe(`${userId}`);
  channel.bind("authFinished", async function (data) {
    const sets = await FetchSettings(get(currentUser).id);
    userSettings.set(sets);
  });
};
