import { currentUser } from "$src/data/cache";
import {
  MinerobeUser,
  OutfitLayerLink,
  PackageSocialData,
  type OutfitPackage,
  OutfitLayer,
  OutfitPackageSnapshotPackage,
} from "$src/data/common";
import {
  DeleteCollection,
  DeleteDocument,
  GetDocument,
  IsDocumentExist,
  SetDocument,
  UpdateDocument,
  UpdateRawDocument,
} from "$src/data/firebase";
import { increment } from "firebase/firestore";
import { get } from "svelte/store";
import { DATA_PATH_CONFIG, LAYER_TYPE } from "$src/data/consts";
import { GetMinerobeUser } from "./auth";
import {
  GenerateQueryEntriesForPackage,
  SetQueryEntriesForPackage,
} from "./query";
import { _ } from "svelte-i18n";

const DATA_PATH = DATA_PATH_CONFIG.PACK_DATA;
const SNAPSHOT_PATH = DATA_PATH_CONFIG.SNAPSHOT_DATA;
const LAYERS_PATH = DATA_PATH_CONFIG.LAYERS_DATA;
const SOCIAL_PATH = DATA_PATH_CONFIG.SOCIAL_DATA;

//basic operations
export const UploadPackage = async function (
  data: OutfitPackage,
  path: string,
  parser = (x:OutfitPackage):OutfitPackage| Promise<OutfitPackage> => x,
  isNew = false,
  generateSnaphot = false,
  snapshotParser = (
    x: OutfitLayer[],
    p: OutfitPackage
  ): OutfitPackageSnapshotPackage | Promise<OutfitPackageSnapshotPackage> =>
    new OutfitPackageSnapshotPackage()
) {
  let item = await parser(Object.assign({}, data)) as any;
  if (!isNew) {
    let exists = await IsDocumentExist(
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

  item.layers = item.layers.map(
    (layer) => new OutfitLayerLink(layer.id, layer.variantId, layer.type)
  );

  delete item.local;
  item.publisher = new MinerobeUser(item.publisher.id, null, null);
  if (isNew) item.social = _generateSocialData();
  else {
    delete item.social;
  }

  await UpdateDocument(path + "/" + item.id + "/" + DATA_PATH, DATA_PATH, item);
  return item;
};
export const FetchPackage = async function (
  path: string,
  id: string,
  parser = (x:OutfitPackage):Promise<OutfitPackage>| OutfitPackage => x,
  layers: number | string[],
  fetchSnapshot = false,
  snapshotParser = (
    x: OutfitLayer[],
    p: OutfitPackage
  ): OutfitPackage | Promise<OutfitPackage> =>
    p
) {
  let pack = (await GetDocument(
    path + "/" + id + "/" + DATA_PATH,
    DATA_PATH
  )) as OutfitPackage;
  if (
    pack == null ||
    (pack?.publisher?.id != get(currentUser)?.id && pack.isShared == false)
  )
    return null;
  if (pack.social == null) {
    pack.social = await _generateSocialData();
    await UpdateDocument(
      path + "/" + id + "/" + SOCIAL_PATH,
      SOCIAL_PATH,
      pack
    );
  }
  let layersToDownload = [];
  if (fetchSnapshot && pack.snapshotConfig?.isMerged) {
    layersToDownload.push(
      new OutfitLayerLink(pack.id, pack.id, LAYER_TYPE.LOCAL)
    );
  } else {
    if (typeof layers == "number") {
      if (layers == -1) layersToDownload = pack.layers;
      else layersToDownload = pack.layers.slice(0, layers);
    } else {
      pack.layers.find((layer) => {
        if (layers.includes(layer.variantId)) layersToDownload.push(layer);
      });
    }
  }
  let layersData = [];
  if (!fetchSnapshot) {
    layersData = await _fetchLayers(layersToDownload, pack, path);
  } else {
    layersData = await _fetchSnapshot(
      pack.snapshotConfig?.isMerged,
      pack,
      path,
      layersToDownload
    );
  }
  pack.local = {};

  if (layersToDownload.length != layersData.filter((x) => x != null).length) {
    Object.assign(pack.local, {
      warnings: ["missingLayer"],
    });
  }
  pack.local.isSnapshot = fetchSnapshot;
  const layersCount = pack.layers.length;
  pack.layers = layersData;
  if (layersCount > layersData.length) {
    pack.layers = pack.layers.concat(
      new Array(layersCount - pack.layers.length).fill(null)
    );
  }
  pack.publisher = await GetMinerobeUser(pack.publisher.id);

  return fetchSnapshot
    ? await snapshotParser(pack.layers, pack)
    : await parser(pack);
};
export const DeletePackage = async function (path: string, id: string) {
  await DeleteCollection(path + "/" + id + "/" + LAYERS_PATH);
  await DeleteCollection(path + "/" + id + "/" + DATA_PATH);
  await DeleteCollection(path + "/" + id + "/" + SNAPSHOT_PATH);
  await DeleteCollection(path + "/" + id + "/" + SOCIAL_PATH);
};

//layer operations
export const UploadPackageLayer = async function (
  pack: OutfitPackage,
  data: OutfitLayer,
  path: string,
  parser = (x) => x,
  generateSnaphot = false,
  snapshotParser = (
    x: OutfitLayer[],
    p: OutfitPackage
  ): OutfitPackageSnapshotPackage | Promise<OutfitPackageSnapshotPackage> =>
    new OutfitPackageSnapshotPackage()
) {
  let item = await parser(Object.assign({}, data));
  await SetDocument(
    path + "/" + pack.id + "/" + LAYERS_PATH,
    item.variantId,
    item
  );
  if (generateSnaphot) {
    let packSnap = Object.assign({}, pack);
    packSnap.layers = [item];
    const snap = await _generateDataForSnapshot(packSnap);
    let snapshots = await snapshotParser(snap.layers, snap);
    await _generateSnapshot(snapshots, path, packSnap);
  }

  return item;
};
export const FetchPackageLayer = async function (
  itemId: string,
  layerId: string,
  path: string,
  parser = (x) => x,
  fetchSnapshot = false,
  parserSnapshot = (x): OutfitPackageSnapshotPackage => x
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
  path: string,
  hasSnapshot = false
) {
  await DeleteDocument(path + "/" + itemId + "/" + LAYERS_PATH, layerId);
  if (hasSnapshot) {
    await DeleteDocument(path + "/" + itemId + "/" + SNAPSHOT_PATH, layerId);
  }
};

//social operations
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
    social: {
      downloads: increment(1),
    },
  });
};
export const ResetSocialLikes = async function (path: string, id: string) {
  await UpdateDocument(path + "/" + id + "/" + SOCIAL_PATH, SOCIAL_PATH, {
    social: {
      likes: 1,
    },
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

//helpers
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
  pack.social = await FetchSocialData(path, pack.id);
  pack.local = {};
  return pack;
};

//internal helpers
const _generateSocialData = async function () {
  let social = new PackageSocialData();
  social.likes = 1;
  social.downloads = 0;
  social.isFeatured = false;
  return social;
};
const _generateSnapshot = async function (
  config: OutfitPackageSnapshotPackage,
  path,
  pack: OutfitPackage
) {
  const isMerged = config.isMerged;
  const snapshots = config.snapshot;
  for (let snapshot of snapshots) {
    //snapshot.modifiedAt = new Date();
    await SetDocument(
      path + "/" + pack.id + "/" + SNAPSHOT_PATH,
      isMerged ? pack.id : snapshot.variantId,
      snapshot
    );
  }
};
const _fetchSnapshot = async function (
  isMerged: boolean,
  pack: OutfitPackage,
  path,
  ids: OutfitLayerLink[]
) {
  const fetchedSnapshots = [];
  if (isMerged) {
    let mergedSnap = await GetDocument(
      path + "/" + pack.id + "/" + SNAPSHOT_PATH,
      pack.id
    );
    if (mergedSnap != null) {
      fetchedSnapshots.push(mergedSnap);
    }
  } else {
    await Promise.all(
      ids.map(async (id) => {
        let snapshot = await GetDocument(
          path + "/" + pack.id + "/" + SNAPSHOT_PATH,
          id.variantId
        );
        if (snapshot != null) {
          fetchedSnapshots.push(snapshot);
        }
      })
    );
  }
  return fetchedSnapshots;
};
const _fetchLayers = async function (
  ids: OutfitLayerLink[],
  pack: OutfitPackage,
  path: string
) {
  return await Promise.all(
    ids.map(async (layer) => {
      if (layer.type == LAYER_TYPE.LOCAL) {
        return await GetDocument(
          path + "/" + pack.id + "/" + LAYERS_PATH,
          layer.id || layer.variantId
        );
      } else {
        let lay = await GetDocument(
          layer.path + "/" + layer.id + "/" + LAYERS_PATH,
          layer.variantId
        );
        if (lay == null) return null;
        lay.id = layer.id;
        lay.type = layer.type;
        return lay;
      }
    })
  );
};
const _generateDataForSnapshot = async function (data: OutfitPackage) {
  let snap = Object.assign({}, data);
  const layers = [];
  for (let layer of data.layers) {
    let layerSnap = new OutfitLayer();
    layerSnap = Object.assign({}, layer);
    layerSnap.steve = Object.assign({}, layer.steve);
    layerSnap.alex = Object.assign({}, layer.alex);
    layers.push(layerSnap);
  }
  snap.layers = layers;
  return snap;
};
