import { ChangeSkin } from "$lib/server/minecraftservice";

export const GET = async (event) => {
  const request = event.request;
  await ChangeSkin(event.params.id, event.params.model);
  return new Response("OK");
};
