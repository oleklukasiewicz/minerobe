import { ChangeSkin } from "$lib/server/minecraftservice";

export const GET = async (event) => {
  const request = event.request;
  try{
  await ChangeSkin(event.params.id, event.params.model,event.params.userId, request.headers.get("authorization"));
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify(e), { status: 500 });
  }
  return new Response("OK");
};
