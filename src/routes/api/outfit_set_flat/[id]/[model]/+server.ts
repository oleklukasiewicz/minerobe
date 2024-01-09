import { FetchSettings } from "$src/api/settings";
import type { MinerobeUserSettings } from "$src/data/common";

export const GET = async (event) => {
  const request = event.request;
  // const authHeader = request.headers.get("authorization");
  // if (
  //   authHeader !== `Bearer ${import.meta.env.CRON_SECRET}` &&
  //   authHeader !== `Bearer ${import.meta.env.VITE_CRON_SECRET}`
  // ) {
  //   return new Response("Unauthorized", {
  //     status: 401,
  //   });
  // }
  const id = event.params.id;
  let settings: MinerobeUserSettings= await FetchSettings(id);
  let imageBlob = await fetch(settings.currentSkin.texture).then(res => res.blob());

  let response = new Response(imageBlob, {
    status: 200,
    headers: {
      'Content-Type': imageBlob.type
    }
  });

  return response;
};
