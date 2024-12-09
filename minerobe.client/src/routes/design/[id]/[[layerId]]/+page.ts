export const load = function ({ params, url }) {
  return {
    id: params.id,
    layerId: params.layerId,
    model: url.searchParams.get("model"),
    isFlat: url.searchParams.get("flat") == "true",
  };
};
