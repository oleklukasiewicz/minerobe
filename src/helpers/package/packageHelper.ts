import { FileData, OutfitLayer, type OutfitPackage } from "$src/data/common";
import { MODEL_TYPE, OUTFIT_TYPE } from "$src/data/consts";
import {
  MergeFileDataToImage,
  MergeLayersToImage,
} from "$src/data/imageMerger";
import { RenderTextureInTemporyNode } from "$src/data/render";
import { GetDominantColorFromImage } from "../image/colorHelper";
import { MergePackageLayers } from "../image/imageDataHelpers";

export const GetLayerSnapshot = async function (layer: OutfitLayer) {
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
  snapLayer.steve.content = steveSnap;
  snapLayer.alex.content = alexSnap;
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
