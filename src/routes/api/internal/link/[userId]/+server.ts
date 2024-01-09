import { authenticateWithPrismarine } from "$lib/server/prismarineAuth";

export const GET = async (params) => {
  const rep = await authenticateWithPrismarine(
    params.params.userId,
    params.request.headers.get("authorization")
  );
  
  return new Response(JSON.stringify(
    {
      requireUserInteraction: rep?.requireUserInteraction,
      profile: rep?.profile,
      params: rep?.params,
    }
  ), { 
    headers: { "content-type": "application/json" },
    status: 200,
    });
};
