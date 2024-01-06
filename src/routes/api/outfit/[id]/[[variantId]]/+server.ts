import { FetchOutfit, FetchOutfitLayerFromLink } from "$src/api/outfits.js";
import { OutfitLayerLink } from "$src/data/common.js";

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
  const variantId = event.params.variantId;

  let outfit;
  if (variantId == null) outfit = await FetchOutfit(id);
  else
    outfit = await FetchOutfitLayerFromLink(new OutfitLayerLink(id, variantId));
  console.log(outfit);
  return new Response(JSON.stringify(outfit), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
