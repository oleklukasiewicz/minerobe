import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitLayer,
  OutfitPackageLink,
  PackageSocialData,
  OutfitPackageSnapshotPackage,
} from "$src/data/common";
import {
  DATA_PATH_CONFIG,
  MODEL_TYPE,
  OUTFIT_TYPE,
  PACKAGE_TYPE,
} from "$src/data/consts";
import { get } from "svelte/store";
import { MergePackageLayers } from "$src/helpers/imageDataHelpers";
import { RenderTextureInTemporyNode } from "$src/data/render";
import { OutfitPackageInstance, OutfitPackageInstanceConfig } from "$src/helpers/outfitPackageHelper";

const parseSnapshot = async function (
  data: OutfitLayer[],
  pack: OutfitPackage
) {
  data[0].id = pack.id;
  data[0].variantId = pack.id;
  data[0].steve.content = await RenderTextureInTemporyNode(
    await MergePackageLayers(pack.layers, MODEL_TYPE.STEVE),
    MODEL_TYPE.STEVE,
    OUTFIT_TYPE.OUTFIT_SET
  );
  data[0].alex.content = await RenderTextureInTemporyNode(
    await MergePackageLayers(pack.layers, MODEL_TYPE.ALEX),
    MODEL_TYPE.ALEX,
    OUTFIT_TYPE.OUTFIT_SET
  );

  const config = new OutfitPackageSnapshotPackage();
  config.isMerged = true;
  config.snapshot = [data[0]];
  return config;
};
const parseSnapshotLocal = async function (x: any, y: any) {
  return y;
};

let config = new OutfitPackageInstanceConfig();
config.isMerged = true;
config.layerCountfromLink = -1;
config.sourcePath = DATA_PATH_CONFIG.OUTFIT_SET;
config.generateSnapshot = false;
config.snapshotParser = parseSnapshot;
config.snapshotParserLocal = parseSnapshotLocal;
config.newPackage = function () {
  const set= new OutfitPackage(
    "New Outfit set",
    MODEL_TYPE.ALEX,
    [],
    PACKAGE_TYPE.OUTFIT_SET,
    get(currentUser),
    undefined,
    false,
    new PackageSocialData()
  );
  return set;
};
export const setsIntance = new OutfitPackageInstance(config);