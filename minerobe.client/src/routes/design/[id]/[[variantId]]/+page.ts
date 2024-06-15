export const load = function ({ params, url }) {
  return {
    id: params.id,
    variantId: params.variantId,
    model: url.searchParams.get("model"),
    isFlat: url.searchParams.get("flat") == "true",
  };
};
