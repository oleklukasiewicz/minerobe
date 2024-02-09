import { FetchOutfit } from "$src/api/outfits";
import { FetchNewPackageFormat, UploadNewPackageFormat } from "$src/api/pack";
import { FetchOutfitSet } from "$src/api/sets";

export const POST = async (params) => {
    const body = await params.request.json();
  const path = body.path;
  const type = body.type;
  const id =body.id;
  let rep=await FetchNewPackageFormat(path, id,undefined,-1);
  //var outfitSet= type == "set" ? await FetchOutfitSet(id) : await FetchOutfit(id);
  rep.layers=rep.layers.filter((layer) => layer.variantId != "bNwanW07ArO348nr0dkB");
  const uploaded=await UploadNewPackageFormat(rep, path);
  
  return new Response(JSON.stringify(rep), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};
