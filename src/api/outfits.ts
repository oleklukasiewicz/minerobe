import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitPackageLink,
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
import { GenerateIdForCollection } from "$src/data/firebase";
import { get } from "svelte/store";
import { FetchPackagesByFilter } from "$src/helpers/packQueryHelper";
import { RenderTextureInTemporyNode } from "$src/data/render";
import { OutfitPackageInstance, OutfitPackageInstanceConfig } from "$src/helpers/outfitPackageHelper";

const OUTFIT_PATH = DATA_PATH_CONFIG.OUTFIT;
const OUTFIT_LAYER_PATH = "dummy";

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
    GenerateIdForOutfit(),
    false,
    new PackageSocialData()
  );
  return outfit;
};

const instance = OutfitPackageInstance(config);

export const GenerateIdForOutfit = () => instance.generateId();
export const GenerateIdForOutfitLayer = () =>
  GenerateIdForCollection(OUTFIT_LAYER_PATH);

export const FetchOutfit = async function (
  id: string,
  layers: any = -1,
  model?: string,
  snapshot: boolean = false
) {
  return await instance.fetch(id, layers, model, snapshot);
};
export const UploadOutfit = async function (
  outfit: OutfitPackage,
  isNew: boolean = false
) {
  return await instance.upload(outfit, isNew);
};
export const CreateOutfit = async function (
  addToWardrobe: boolean = false,
  isShared: boolean = false
) {
  console.log("Creating new outfit");
  let outfit = await instance.create(addToWardrobe, isShared);
  return outfit;
};
export const DeleteOutfit = async function (outfit: OutfitPackage) {
  return await instance.delete(outfit.id);
};
export const UploadLayer = async function (
  pack: OutfitPackage,
  layer: OutfitLayer
) {
  await instance.uploadLayer(pack, layer);
};
export const RemoveLayer = async function (id: string, layerId: string) {
  instance.removeLayer(id, layerId);
};
export const FetchOutfitByFilter = async function (
  ids: string[],
  clauses: any[]
) {
  let outfits = await FetchPackagesByFilter(ids, OUTFIT_PATH, clauses);
  return outfits;
};
export const FetchOutfitFromLink = async function (link: OutfitPackageLink) {
  return await instance.fetchFromLink(link);
};
