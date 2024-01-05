export const load = function ({ params }) {
  return {
    type: params.type,
    id: params.id,
    variantId: params.variantId,
  };
};
