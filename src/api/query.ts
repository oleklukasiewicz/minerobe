import {
  OutfitPackageQueryData,
  type OutfitPackage,
  OutfitLayer,
} from "$src/data/common";
import {
  DATA_PATH_CONFIG,
  LAYER_TYPE,
  PACKAGE_TYPE,
  QUERY_DATA_TYPE,
} from "$src/data/consts";
import { SetDocument } from "$src/data/firebase";
import { FindColorTitle } from "$src/helpers/colorHelper";

const QUERY_PATH = DATA_PATH_CONFIG.QUERY;

const _getDataTypeForPackage = function (pack: OutfitPackage) {
  if (pack.type == PACKAGE_TYPE.OUTFIT) return QUERY_DATA_TYPE.OUTFIT;
  if (pack.type == PACKAGE_TYPE.OUTFIT_SET) return QUERY_DATA_TYPE.OUTFIT_SET;
  if (pack.type == PACKAGE_TYPE.OUTFIT_COLLECTION)
    return QUERY_DATA_TYPE.OUTFIT_COLLECTION;
  return QUERY_DATA_TYPE.DEFAULT;
};
const _generateEntryForPackage = function (pack: OutfitPackage) {
  let entry = new OutfitPackageQueryData();
  entry.id = pack.id;
  entry.name = pack.name;
  entry.type = pack.type;
  entry.model = pack.model;
  entry.description = pack.description;

  entry.createdAt = pack.createdAt;
  entry.modifiedAt = pack.modifiedAt;

  entry.publisherId = pack.publisher.id;
  entry.likes = pack.social?.likes || 0;
  entry.downloads = pack.social?.downloads || 0;
  entry.isShared = pack.isShared;
  entry.isFeatured = pack.social?.isFeatured || false;

  //layers data
  entry.variantCount = pack.layers.length;
  entry.variantId = "none";
  entry.color = pack.layers[0]?.steve.color;
  if (entry.color)
    entry.normalizedColor = pack.layers[0]
      ? FindColorTitle(entry.color)
      : null;
  entry.outfitType = pack.outfitType || "none";
  return entry;
};
const _generateEntryForLayer = function (
  pack: OutfitPackage,
  layer: OutfitLayer
) {
  let entry = new OutfitPackageQueryData();
  entry.id = pack.id;
  entry.name = pack.name;
  entry.type = pack.type;
  entry.model = pack.model;
  entry.description = pack.description;

  entry.createdAt = pack.createdAt;
  entry.modifiedAt = pack.modifiedAt;

  entry.publisherId = pack.publisher.id;
  entry.likes = pack.social?.likes || 0;
  entry.downloads = pack.social?.downloads || 0;
  entry.isShared = pack.isShared;
  entry.isFeatured = pack.social?.isFeatured || false;

  //layers data
  entry.variantCount = 1;
  entry.variantId = layer.variantId;
  entry.color = layer.steve.color;
  if (entry.color) entry.normalizedColor = FindColorTitle(entry.color);
  entry.outfitType = layer.steve.type;
  return entry;
};
export const GenerateQueryEntriesForPackage = function (pack: OutfitPackage) {
  const entries = [];
  const name = _getDataTypeForPackage(pack) + "-" + pack.id;
  const mainEntry = _generateEntryForPackage(pack);
  entries.push({
    name,
    data: mainEntry,
  });
  pack.layers.forEach((layer) => {
    if (layer.type == LAYER_TYPE.LOCAL) {
      const entry = _generateEntryForLayer(pack, layer);
      entries.push({
        name: name + "-" + layer.variantId,
        data: entry,
      });
    }
  });
  return entries;
};
export const SetQueryEntriesForPackage = async function (entries: any[]) {
  for (let entry of entries) {
    await SetDocument(QUERY_PATH, entry.name, entry.data);
  }
};
