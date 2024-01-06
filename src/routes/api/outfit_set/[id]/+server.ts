import { FetchOutfitSetSnapshot } from "$src/api/sets";

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
  let outfit= await FetchOutfitSetSnapshot(id);
  return new Response(JSON.stringify(outfit), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
