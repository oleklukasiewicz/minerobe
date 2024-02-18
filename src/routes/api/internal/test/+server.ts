export const POST = async (params) => {
  const rep = {};

  return new Response(JSON.stringify(rep), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};
