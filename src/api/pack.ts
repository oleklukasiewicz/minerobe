import { currentUser } from "$src/data/cache";
import {
  MinerobeUser,
  OutfitLayerLink,
  PackageSocialData,
  type OutfitPackage,
} from "$src/data/common";
import {
  BuildQuery,
  DeleteCollection,
  DeleteDocument,
  DeleteDocumentAnonymous,
  FetchDocsFromQuery,
  GetDocument,
  SetDocument,
  SetDocumentAnonymous,
  UpdateDocument,
} from "$src/data/firebase";
import { AddItemToWardrobe } from "$src/helpers/apiHelper";
import type { DocumentData, Query } from "firebase/firestore";
import { get } from "svelte/store";
import { FetchSocial } from "./social";
import { DeleteQueryData, UploadQueryData } from "./query";
import { LAYER_TYPE } from "$src/data/consts";
import { GetMinerobeUser } from "./auth";

const DATA_PATH = "itemdata";
const SNAPSHOT_PATH = "snapshot";
const LAYERS_PATH = "layers";
const SOCIAL_PATH = "social";
export const _FetchPackage = async function (path: string, onlyData = false) {
  let pack = (await GetDocument(path, DATA_PATH)) as OutfitPackage;
  if (
    pack == null ||
    (pack?.publisher?.id != get(currentUser)?.id && pack.isShared == false)
  )
    return null;

  if (onlyData) return pack;
  pack.social = await FetchSocial(path);
  return pack;
};

export const UploadPackage = async function (
  path: string,
  pack: OutfitPackage,
  isNew = false,
  parser = (x, y) => x,
  snapshotParser = (x) => x
) {
  if (pack.publisher.id != get(currentUser)?.id || pack.id == null) return;
  pack.modifiedAt = new Date();
  if (pack.createdAt == null) pack.createdAt = new Date();
  let parsed = await parser(pack, isNew);
  delete parsed.social;
  delete parsed.local;
  await UpdateDocument(path, DATA_PATH, parsed);
  await UploadPackageSnapshot(path, Object.assign({}, pack), snapshotParser);
  await UploadQueryData(pack);
};
export const FetchPackage = async function (path: string, parser = (x) => x) {
  let pack = await _FetchPackage(path);
  if (pack == null) return null;
  return await parser(pack);
};
export const CreatePackage = async function (
  data: OutfitPackage,
  path: string,
  parser = (x) => x,
  snapshotParser = (x) => x,
  addToWardrobe = true
) {
  await UploadPackage(path, data, true, parser, snapshotParser);
  if (addToWardrobe) {
    await AddItemToWardrobe(data);
  }
  return data;
};
export const DeletePackage = async function (
  pack: OutfitPackage,
  path: string
) {
  if (pack.publisher.id != get(currentUser)?.id) return;
  await DeleteCollection(path);
  await DeleteQueryData(pack);
};
export const FetchPackageSnapshot = async function (
  path: string,
  parser = (x) => x
) {
  let pack = await GetDocument(path, SNAPSHOT_PATH);
  if (pack == null) pack = await GetDocument(path, DATA_PATH);
  if (
    pack == null ||
    (pack?.publisher?.id != get(currentUser)?.id && pack.isShared == false)
  )
    return null;
  return await parser(pack);
};
export const UploadPackageSnapshot = async function (
  path: string,
  pack: OutfitPackage,
  parser = (x) => x
) {
  if (pack.publisher.id != get(currentUser)?.id || pack.id == null) return;
  let parsed = await parser(pack);
  await UpdateDocument(path, SNAPSHOT_PATH, parsed);
};
export const FetchRawPackage = async function (
  path: string,
  parser = (x) => x
) {
  let pack = await _FetchPackage(path, true);
  if (pack == null) return null;
  return await parser(pack);
};
export const FetchPackageFromQuery = async function (
  query: Query<DocumentData, DocumentData>[],
  parser = (x) => x
) {
  const docs = (await FetchDocsFromQuery(query)) as any[];
  let parsedDocs = [];
  for (let i = 0; i < docs.length; i++) {
    const docsArr = docs[i];
    for (let j = 0; j < docsArr.length; j++) {
      const doc = docsArr[j];
      if (doc != null) parsedDocs.push(await parser(doc));
    }
  }
  return parsedDocs;
};
export const FetchPackagesByFilter = async function (
  packsIds,
  path,
  localPath,
  filter,
  parser = (x) => x
) {
  let query = await BuildQuery(path, localPath, DATA_PATH, packsIds, filter);
  return await FetchPackageFromQuery(query, parser);
};

export const UploadNewPackageFormat = async function (
  data: OutfitPackage,
  path: string,
  parser = (x) => x,
  isNew = false
) {
  let item = await parser(Object.assign({}, data));
  await Promise.all(
    item.layers.map(async (layer) => {
      if (layer.type == LAYER_TYPE.LOCAL) {
        const oldContent = item.local?.oldlayers?.find(
          (oldLayer) => oldLayer.variantId == layer.variantId
        );
        if (oldContent == null || oldContent.content != JSON.stringify(layer)) {
          await SetDocument(
            path + "/" + item.id + "/" + LAYERS_PATH,
            layer.variantId || layer.id,
            layer
          );
        }
      }
    })
  );
  if (
    item.local?.oldlayers &&
    item.local.oldlayers.length != item.layers.length
  ) {
    let layersToRemove = item.local.oldlayers.filter(
      (oldLayer) =>
        !item.layers.find(
          (layer) =>
            layer.variantId == oldLayer.variantId ||
            layer.id == oldLayer.variantId
        )
    );
    await Promise.all(
      layersToRemove.map(async (layer) => {
        await DeleteDocument(
          path + "/" + item.id + "/" + LAYERS_PATH + "/",
          layer.id || layer.variantId
        );
      })
    );
  }

  item.layers = item.layers.map((layer) => {
    return new OutfitLayerLink(layer.id, layer.variantId, layer.type);
  }) as any;

  if (!isNew) delete item.social;
  delete item.local;
  item.publisher = new MinerobeUser(item.publisher.id, null, null);

  await SetDocument(path + "/" + item.id + "/" + DATA_PATH, DATA_PATH, item);
  return item;
};
export const FetchNewPackageFormat = async function (
  path: string,
  id: string,
  parser = (x) => x,
  layers: number | string[]
) {
  let pack = await GetDocument(path + "/" + id + "/" + DATA_PATH, DATA_PATH);

  if (
    pack == null ||
    (pack?.publisher?.id != get(currentUser)?.id && pack.isShared == false)
  )
    return null;

  let layersToDownload = [];

  if (typeof layers == "number") {
    if (layers == -1) layersToDownload = pack.layers;
    else layersToDownload = pack.layers.slice(0, layers);
  } else {
    pack.layers.find((layer) => {
      if (layers.includes(layer.variantId)) layersToDownload.push(layer);
    });
  }

  let layersData = await Promise.all(
    layersToDownload.map(async (layer) => {
      if (layer.type == LAYER_TYPE.LOCAL) {
        return await GetDocument(
          path + "/" + id + "/" + LAYERS_PATH,
          layer.id || layer.variantId
        );
      } else {
        let lay = await GetDocument(
          layer.path + "/" + layer.id + "/" + LAYERS_PATH,
          layer.variantId
        );
        lay.id = layer.id;
        return lay;
      }
    })
  );
  pack.layers = layersData;
  pack.publisher = await GetMinerobeUser(pack.publisher.id);

  pack.local = {};
  pack.local.oldlayers = pack.layers.map((layer) => ({
    variantId: layer.variantId,
    content: JSON.stringify(layer),
  }));
  return await parser(pack);
};
