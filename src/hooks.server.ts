// hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { locale } from "svelte-i18n";
import { socketServer } from "$lib/server/services/socketService";

export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.request.headers.get("accept-language")?.split(",")[0];
  if (lang) {
    locale.set(lang);
  }
  return resolve(event);
};

socketServer.on("connection", (socket) => {
	console.log("Socket connected");
	socket.on("disconnect", () => {
	  console.log("Socket disconnected");
	});
	socket.on("join", (data) => {
	  socket.join(data);
  });
});
