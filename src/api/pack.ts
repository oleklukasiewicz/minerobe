import { currentUser } from "$src/data/cache";
import {
  MinerobeUser,
  OutfitLayerLink,
  PackageSocialData,
  type OutfitPackage,
  OutfitLayer,
} from "$src/data/common";
import {
  BuildQuery,
  DeleteCollection,
  DeleteDocument,
  FetchDocsFromQuery,
  GetDocument,
  SetDocument,
  UpdateRawDocument,
} from "$src/data/firebase";
import { increment, type DocumentData, Query } from "firebase/firestore";
import { get } from "svelte/store";
import { DATA_PATH_CONFIG, LAYER_TYPE } from "$src/data/consts";
import { GetMinerobeUser } from "./auth";
import {
  GenerateQueryEntriesForPackage,
  SetQueryEntriesForPackage,
} from "./query";

const DATA_PATH = DATA_PATH_CONFIG.PACK_DATA;
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
  isNew = false,
  generateSnaphot = false,
  snapshotParser = (x, p) => x
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
  if (isNew || item.createdAt == null) {
    item.createdAt = new Date();
  }
  item.modifiedAt = new Date();

  var queryEntries = GenerateQueryEntriesForPackage(item);
  await SetQueryEntriesForPackage(queryEntries);

  if (generateSnaphot && item.layers.length > 0) {
    let snap= Object.assign({}, data);
    let snapshots = await snapshotParser(
     Object.assign({}, snap.layers[0]),
     snap
    );
    for (let snapshot of snapshots) {
      await SetDocument(
        path + "/" + item.id + "/" + SNAPSHOT_PATH,
        snapshot.variantId,
        snapshot
      );
      await UpdateRawDocument(
        path + "/" + item.id + "/" + SNAPSHOT_PATH,
        snapshot.variantId,
        {
          modifiedAt: new Date(),
        }
      );
    }
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
  layers: number | string[],
  fetchSnapshot = false,
  parserSnapshot = (x) => x
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
    if (layers.length > 0 && layers[0] == pack.id) {
      layersToDownload.push(
        new OutfitLayerLink(pack.id, pack.id, LAYER_TYPE.LOCAL)
      );
    } else
      pack.layers.find((layer) => {
        if (layers.includes(layer.variantId)) layersToDownload.push(layer);
      });
  }
  const layersPath = fetchSnapshot ? SNAPSHOT_PATH : LAYERS_PATH;
  let layersData = await Promise.all(
    layersToDownload.map(async (layer) => {
      if (layer.type == LAYER_TYPE.LOCAL) {
        return await GetDocument(
          path + "/" + id + "/" + layersPath,
          layer.id || layer.variantId
        );
      } else {
        let lay = await GetDocument(
          layer.path + "/" + layer.id + "/" + layersPath,
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
  return fetchSnapshot ? await parserSnapshot(pack) : await parser(pack);
};
export const DeletePackage = async function (path: string, id: string) {
  await DeleteCollection(path + "/" + id + "/" + LAYERS_PATH);
  await DeleteCollection(path + "/" + id + "/" + DATA_PATH);
  await DeleteCollection(path + "/" + id + "/" + SNAPSHOT_PATH);
  await DeleteCollection(path + "/" + id + "/" + SOCIAL_PATH);
};
export const UploadPackageLayer = async function (
  pack: OutfitPackage,
  data: OutfitLayer,
  path: string,
  parser = (x) => x,
  generateSnaphot = false,
  snapshotParser = (x, p) => x
) {
  let item = await parser(Object.assign({}, data));
  await SetDocument(
    path + "/" + pack.id + "/" + LAYERS_PATH,
    item.variantId,
    item
  );
  await UpdateRawDocument(path + "/" + pack.id + "/" + DATA_PATH, DATA_PATH, {
    modifiedAt: new Date(),
  });
  if (generateSnaphot) {
    let snapshots = await snapshotParser(Object.assign({}, data), pack);
    for (let snapshot of snapshots) {
      await SetDocument(
        path + "/" + pack.id + "/" + SNAPSHOT_PATH,
        item.variantId,
        snapshot
      );
      await UpdateRawDocument(
        path + "/" + pack.id + "/" + DATA_PATH,
        DATA_PATH,
        {
          modifiedAt: new Date(),
        }
      );
    }
  }

  return item;
};
export const FetchPackageLayer = async function (
  itemId: string,
  layerId: string,
  path: string,
  parser = (x) => x,
  fetchSnapshot = false,
  parserSnapshot = (x) => x
) {
  const layersPath = fetchSnapshot ? SNAPSHOT_PATH : LAYERS_PATH;
  let layer = await GetDocument(
    path + "/" + itemId + "/" + layersPath,
    layerId
  );
  return fetchSnapshot ? await parserSnapshot(layer) : await parser(layer);
};
export const DeletePackageLayer = async function (
  itemId: string,
  layerId: string,
  path: string
) {
  await DeleteDocument(path + "/" + itemId + "/" + LAYERS_PATH, layerId);
  await UpdateRawDocument(path + "/" + itemId + "/" + DATA_PATH, DATA_PATH, {
    modifiedAt: new Date(),
  });
};
export const GiveLike = async function (path: string, id: string) {
  await UpdateRawDocument(path + "/" + id + "/" + SOCIAL_PATH, SOCIAL_PATH, {
    social: {
      likes: increment(1),
    },
  });
};
export const RemoveLikeData = async function (path: string, id: string) {
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
export const PatchPackage = async function (pack: OutfitPackage, path: string) {
  const layersPath = LAYERS_PATH;
  let layersData = await Promise.all(
    pack.layers.map(async (layer: any) => {
      if (layer.type == LAYER_TYPE.LOCAL) {
        return await GetDocument(
          path + "/" + pack.id + "/" + layersPath,
          layer.id || layer.variantId
        );
      } else {
        let lay = await GetDocument(
          layer.path + "/" + layer.id + "/" + layersPath,
          layer.variantId
        );
        lay.id = layer.id;
        lay.type = layer.type;
        return lay;
      }
    })
  );
  pack.layers = layersData;
  //pack.publisher = new MinerobeUser(pack.publisher.id, null, null);
  pack.social = await FetchSocialData(path, pack.id);
  pack.local = {};
  return pack;
};
