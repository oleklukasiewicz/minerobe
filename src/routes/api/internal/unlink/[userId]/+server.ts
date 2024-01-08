import { authenticateWithPrismarine, refreshWithPrismarine } from "$lib/server/prismarineAuth";

export const GET = async (params) => {
  const rep = await refreshWithPrismarine(
    params.params.userId,
    params.request.headers.get("authorization")
  );
  return new Response(JSON.stringify(rep), { 
    headers: { "content-type": "application/json" },
    status: 200,
    });
};
