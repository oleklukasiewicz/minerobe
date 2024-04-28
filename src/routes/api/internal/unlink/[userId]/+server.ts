import { UnLinkAccount } from "$lib/server/services/minecraftServices.js";

export const GET = async (params) => {
  const rep = await UnLinkAccount(
    params.params.userId,
    params.request.headers.get("authorization")
  );
  return new Response(JSON.stringify(rep), { 
    headers: { "content-type": "application/json" },
    status: 200,
    });
};
