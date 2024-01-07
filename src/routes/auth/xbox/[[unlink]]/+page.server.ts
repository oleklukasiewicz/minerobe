import { authenticateWithPrismarine, refreshWithPrismarine } from "$lib/server/prismarineAuth";



export const load = async ({params}) => {
  console.log(params);
  const auth = params.unlink!="unlink" ? await authenticateWithPrismarine() : await refreshWithPrismarine();

  return { ...auth };
};
