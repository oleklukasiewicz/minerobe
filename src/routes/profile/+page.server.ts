import { authenticateWithPrismarine } from "$lib/server/prismarineAuth";

export const load = async () => {
  return {
    ...await authenticateWithPrismarine(),
  };
};
