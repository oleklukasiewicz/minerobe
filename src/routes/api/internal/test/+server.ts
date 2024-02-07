import { FetchOutfit } from "$src/api/outfits";
import { FetchNewPackageFormat, UploadNewPackageFormat } from "$src/api/pack";
import { FetchOutfitSet } from "$src/api/sets";

export const POST = async (params) => {
    const body = await params.request.json();
  const path = body.path;
  const type = body.type;
  const id =body.id;
  
  var outfitSet= type == "set" ? await FetchOutfitSet(id) : await FetchOutfit(id);
  await UploadNewPackageFormat(outfitSet, path);
  const rep=await FetchNewPackageFormat(path, outfitSet.id, ["qiiEnk4NJxpxIrEsuArT"]);
  return new Response(JSON.stringify(rep), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};
