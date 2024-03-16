// hooks.server.ts
import { configureServerSocket } from "$lib/server/services/socketService";
import type { Handle } from "@sveltejs/kit";
import { locale } from "svelte-i18n";

configureServerSocket();

export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.request.headers.get("accept-language")?.split(",")[0];
  if (lang) {
    locale.set(lang);
  }
  return resolve(event);
};
