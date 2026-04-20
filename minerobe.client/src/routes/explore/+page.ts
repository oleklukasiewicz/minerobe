export const load = function ({ url }) {
  return {
    query: url.searchParams.get("q") ?? "",
  };
};