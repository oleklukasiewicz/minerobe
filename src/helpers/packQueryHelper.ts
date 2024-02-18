import { PatchPackage } from "$src/api/pack";
import { OutfitPackage } from "$src/data/common";
import { DATA_PATH_CONFIG } from "$src/data/consts";
import { BuildQuery, FetchDocsFromQuery } from "$src/data/firebase";

const DATA_PATH = DATA_PATH_CONFIG.PACK_DATA;
export const FetchPackagesByFilter = async function (
  packsIds: string[],
  path: string,
  filter: any
) {
  let query = await BuildQuery(path, DATA_PATH, DATA_PATH, packsIds, filter);
  let docs = (await FetchDocsFromQuery(query)).filter((x) => x.length > 0);
  let patched = await Promise.all(
    docs.map(async (doc) => {
      return await PatchPackage(doc[0] as OutfitPackage, path);
    })
  );
  return patched;
};
