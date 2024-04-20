import { ChangeSkin } from "$lib/server/services/minecraftServices";

export const GET = async (event) => {
  const request = event.request;
  try {
    let attempts = 0;
    let result = false;

    while (attempts < 3 && !result) {
      result = await ChangeSkin(
        event.params.id,
        event.params.model,
        event.params.userId,
        request.headers.get("authorization")
      );
      attempts++;
    }

    if (!result) return new Response("Error in minecraft services", { status: 500 });
    return new Response("OK");
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify(e), { status: 500 });
  }
};
