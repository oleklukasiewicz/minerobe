import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  PackageSocialData,
  OutfitLayer,
  OutfitPackageSnapshotPackage,
} from "$src/data/common";
import {
  DATA_PATH_CONFIG,
  MODEL_TYPE,
  OUTFIT_TYPE,
  PACKAGE_TYPE,
} from "$src/data/consts";
import { get } from "svelte/store";
import { RenderTextureInTemporyNode } from "$src/data/render";
import { OutfitPackageInstance, OutfitPackageInstanceConfig } from "$src/helpers/package/packageInstanceHelper";

const OUTFIT_PATH = DATA_PATH_CONFIG.OUTFIT;

const parseToLocal = async function (data: OutfitPackage) {
  data.outfitType =
    data.layers.length > 0 ? data.layers[0].steve.type : OUTFIT_TYPE.DEFAULT;
  return data;
};
const parseSnapshot = async function (
  data: OutfitLayer[],
  pack: OutfitPackage
) {
  const config = new OutfitPackageSnapshotPackage();
  config.isMerged = false;
  let layers = pack.layers;
  for (let layer of layers) {
    const steve = await RenderTextureInTemporyNode(
      layer.steve.content,
      MODEL_TYPE.STEVE,
      layer.steve.type
    );
    const alex = await RenderTextureInTemporyNode(
      layer.alex.content,
      MODEL_TYPE.ALEX,
      layer.alex.type
    );
    layer.steve.content = steve;
    layer.alex.content = alex;
  }
  config.snapshot = layers;

  return config;
};
const parseSnapshotLocal = async function (x: any, y: any) {
  return y;
};

const config = new OutfitPackageInstanceConfig();
config.sourcePath = OUTFIT_PATH;
config.isMerged = false;
config.generateSnapshot = true;
config.layerCountfromLink = 2;
config.snapshotParser = parseSnapshot;
config.parserLocal = parseToLocal;
config.snapshotParserLocal = parseSnapshotLocal;
config.newPackage = function () {
  let outfit = new OutfitPackage(
    "New outfit",
    MODEL_TYPE.ALEX,
    [],
    PACKAGE_TYPE.OUTFIT,
    get(currentUser),
    undefined,
    false,
    new PackageSocialData()
  );
  return outfit;
};

export const outfitsInstance = new OutfitPackageInstance(config);

export const FetchOutfitByFilter = async function (
  ids: string[],
  clauses: any[],
  isSnapshot = false
) {
  let outfits =[];
  return outfits;
};

