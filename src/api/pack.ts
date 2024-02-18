import { currentUser } from "$src/data/cache";
import {
  MinerobeUser,
  OutfitLayerLink,
  PackageSocialData,
  type OutfitPackage,
  OutfitLayer,
} from "$src/data/common";
import {
  DeleteCollection,
  DeleteDocument,
  GetDocument,
  SetDocument,
  UpdateRawDocument,
} from "$src/data/firebase";
import { increment } from "firebase/firestore";
import { get } from "svelte/store";
import { LAYER_TYPE } from "$src/data/consts";
import { GetMinerobeUser } from "./auth";

const DATA_PATH = "itemdata";
const SNAPSHOT_PATH = "snapshot";
const LAYERS_PATH = "layers";
const SOCIAL_PATH = "social";
const _generateSocialData = async function () {
  let social = new PackageSocialData();
  social.likes = 1;
  social.downloads = 0;
  social.isFeatured = false;
  return social;
};
export const UploadPackage = async function (
  data: OutfitPackage,
  path: string,
  parser = (x) => x,
  isNew = false
) {
  let item = await parser(Object.assign({}, data));
  if (!isNew) {
    //check if exists
    let exists = await GetDocument(
      path + "/" + item.id + "/" + DATA_PATH,
      DATA_PATH
    );
    if (exists == null) return null;
  }

  item.layers = item.layers.map(
    (layer) => new OutfitLayerLink(layer.id, layer.variantId, layer.type)
  );
  delete item.social;
  delete item.local;
  item.publisher = new MinerobeUser(item.publisher.id, null, null);

  await SetDocument(path + "/" + item.id + "/" + DATA_PATH, DATA_PATH, item);
  if (isNew)
    await SetDocument(
      path + "/" + item.id + "/" + SOCIAL_PATH,
      SOCIAL_PATH,
      await _generateSocialData()
    );
  return item;
};
export const FetchPackage = async function (
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
  let social = await GetDocument(
    path + "/" + id + "/" + SOCIAL_PATH,
    SOCIAL_PATH
  );
  if (social == null) {
    social = await _generateSocialData();
    await SetDocument(path + "/" + id + "/" + SOCIAL_PATH, SOCIAL_PATH, social);
  }
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
        lay.type = layer.type;
        return lay;
      }
    })
  );
  pack.layers = layersData;
  pack.social = social;
  pack.publisher = await GetMinerobeUser(pack.publisher.id);

  pack.local = {};
  return await parser(pack);
};
export const DeletePackage = async function (path: string, id: string) {
  await DeleteCollection(path + "/" + id + "/" + LAYERS_PATH);
  await DeleteCollection(path + "/" + id + "/" + DATA_PATH);
  await DeleteCollection(path + "/" + id + "/" + SNAPSHOT_PATH);
};
export const UploadPackageLayer = async function (
  itemId: string,
  data: OutfitLayer,
  path: string,
  parser = (x) => x
) {
  let item = await parser(Object.assign({}, data));
  await SetDocument(
    path + "/" + itemId + "/" + LAYERS_PATH,
    item.variantId,
    item
  );
  return item;
};
export const FetchPackageLayer = async function (
  itemId: string,
  layerId: string,
  path: string,
  parser = (x) => x
) {
  let layer = await GetDocument(
    path + "/" + itemId + "/" + LAYERS_PATH,
    layerId
  );
  return await parser(layer);
};
export const DeletePackageLayer = async function (
  itemId: string,
  layerId: string,
  path: string
) {
  await DeleteDocument(path + "/" + itemId + "/" + LAYERS_PATH, layerId);
};
export const GiveLike = async function (path: string, id: string) {
  await UpdateRawDocument(path + "/" + id + "/" + SOCIAL_PATH, SOCIAL_PATH, {
    social: {
      likes: increment(1),
    },
  });
};
export const RemoveLike = async function (path: string, id: string) {
  await UpdateRawDocument(path + "/" + id + "/" + SOCIAL_PATH, SOCIAL_PATH, {
    social: {
      likes: increment(-1),
    },
  });
};
export const AddDownloadData = async function (path: string, id: string) {
  await UpdateRawDocument(path + "/" + id + "/" + SOCIAL_PATH, SOCIAL_PATH, {
    downloads: increment(1),
  });
};
export const ResetSocialLikes = async function (path: string, id: string) {
  await SetDocument(path + "/" + id + "/" + SOCIAL_PATH, SOCIAL_PATH, {
    likes: 1,
  });
};
export const FetchSocialData = async function (path: string, id: string) {
  return await GetDocument(path + "/" + id + "/" + SOCIAL_PATH, SOCIAL_PATH);
};
export const SharePackage = async function (path: string, item: OutfitPackage) {
  await UpdateRawDocument(path + "/" + item.id + "/" + DATA_PATH, DATA_PATH, {
    isShared: true,
  });
  for (let layer of item.layers) {
    if (layer.type == LAYER_TYPE.LOCAL) {
      await UpdateRawDocument(
        path + "/" + item.id + "/" + LAYERS_PATH,
        layer.variantId,
        {
          isShared: true,
        }
      );
    }
  }
};
export const UnsharePackage = async function (
  path: string,
  item: OutfitPackage
) {
  await UpdateRawDocument(path + "/" + item.id + "/" + DATA_PATH, DATA_PATH, {
    isShared: false,
  });
  await ResetSocialLikes(path, item.id);
  for (let layer of item.layers) {
    if (layer.type == LAYER_TYPE.LOCAL) {
      await UpdateRawDocument(
        path + "/" + item.id + "/" + LAYERS_PATH,
        layer.variantId,
        {
          isShared: false,
        }
      );
    }
  }
};
