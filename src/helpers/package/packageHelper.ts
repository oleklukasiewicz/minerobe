import { AddPackage } from "$src/api/pack";
import { FileData, OutfitLayer, OutfitPackage } from "$src/data/common";
import { MODEL_TYPE, OUTFIT_TYPE } from "$src/data/consts";
import { RenderTextureInTemporyNode } from "$src/data/render";
import { GetDominantColorFromImage } from "../image/colorHelper";
import { MergePackageLayers } from "../image/imageDataHelpers";

export const AddLayerSnapshot = async function (oldLayer: OutfitLayer) {
  const layer = Object.assign({}, oldLayer);
  const steve = layer.steve;
  const steveSnap = await RenderTextureInTemporyNode(
    steve.content,
    MODEL_TYPE.STEVE,
    steve.type
  );
  const alex = layer.alex;
  const alexSnap = await RenderTextureInTemporyNode(
    alex.content,
    MODEL_TYPE.ALEX,
    alex.type
  );
  const snapLayer = Object.assign({}, layer);
  snapLayer.steve.contentSnapshot = steveSnap;
  snapLayer.alex.contentSnapshot = alexSnap;
  return snapLayer;
};
export const GetGlobalLayer = async function (pack: OutfitPackage) {
  const steve = await MergePackageLayers(pack.layers, MODEL_TYPE.STEVE);
  const steveFileData = new FileData(
    pack.name,
    steve,
    OUTFIT_TYPE.OUTFIT_SET,
    await GetDominantColorFromImage(steve)
  );
  const alex = await MergePackageLayers(pack.layers, MODEL_TYPE.ALEX);
  const alexFileData = new FileData(
    pack.name,
    alex,
    OUTFIT_TYPE.OUTFIT_SET,
    await GetDominantColorFromImage(alex)
  );
  const glob = new OutfitLayer(pack.name, steveFileData, alexFileData);
  glob.sourcePackageId = pack.id;
  return glob;
};
export const CreateNewOutfitPackage = async function (
  name: string,
  type: string
) {
  const pack = new OutfitPackage(name, MODEL_TYPE.STEVE, [], type);
  pack.description = "";
  return pack;
};
