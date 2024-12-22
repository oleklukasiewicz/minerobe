import { MODEL_TYPE } from "$src/data/enums/model";
import { OUTFIT_TYPE } from "$src/data/enums/outfit";
import { OutfitPackageToTextureConverter } from "$src/data/render";
import {
  FileData,
  OutfitLayer,
  OutfitPackage,
} from "$data/models/package";
import {
  FindColorTitle,
  GetDominantColorFromImageContext,
} from "../image/colorHelper";
import { GetContextFromBase64 } from "../image/imageDataHelpers";

export const MergePackageLayersToSingleLayer = async function (
  outfitPackage: OutfitPackage
): Promise<OutfitLayer> {
  const merger = new OutfitPackageToTextureConverter();
  merger.SetOutfitPackage(outfitPackage);

  merger.SetModel(MODEL_TYPE.ALEX);
  const textureAlex = await merger.ConvertAsync();
  merger.SetModel(MODEL_TYPE.STEVE);
  const textureSteve = await merger.ConvertAsync();

  const mergedLayer = new OutfitLayer();

  const context = await GetContextFromBase64(textureSteve);
  const color = await GetDominantColorFromImageContext(context);
  const colorName = await FindColorTitle(color);

  mergedLayer.alex = new FileData("merged", textureAlex);
  mergedLayer.steve = new FileData("merged", textureSteve);
  mergedLayer.name = "Merged";
  mergedLayer.sourcePackageId = outfitPackage.id;
  mergedLayer.outfitType = OUTFIT_TYPE.OUTFIT_SET;
  mergedLayer.colorName = colorName;
  return mergedLayer;
};
