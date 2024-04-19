// hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { locale } from "svelte-i18n";
import { configureSocketServer } from "$lib/server/services/socketService";

export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.request.headers.get("accept-language")?.split(",")[0];
  if (lang) {
    locale.set(lang);
  }
  return resolve(event);
};

configureSocketServer();