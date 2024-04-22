import { LinkAccount } from "$lib/server/services/minecraftServices.js";

export const GET = async (params) => {
  const rep = await LinkAccount(
    params.params.userId,
    params.request.headers.get("authorization")
  );

  return new Response(
    JSON.stringify({
      requireUserInteraction: rep?.requireUserInteraction,
      profile: rep?.profile,
      params: rep?.params,
    }),
    {
      headers: { "content-type": "application/json" },
      status: 200,
    }
  );
};
