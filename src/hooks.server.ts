// hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { locale } from "svelte-i18n";

export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.request.headers.get("accept-language")?.split(",")[0];
  if (lang) {
    locale.set(lang);
  }
  return resolve(event);
};

//infinite loop tat send console.log every 5 sec

setTimeout(async () => {
  while (true) {
    console.log("Server is alive");
    await new Promise((r) => setTimeout(r, 5000));
  }
});

