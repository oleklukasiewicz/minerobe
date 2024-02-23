import {
    DeletePackage,
    DeletePackageLayer,
    FetchPackage,
    UploadPackage,
    UploadPackageLayer,
  } from "$src/api/pack";
import { AddLike } from "$src/api/social";
import { wardrobe } from "$src/data/cache";
  import {
    OutfitPackage,
    type OutfitLayer,
    type OutfitPackageLink,
    type OutfitPackageSnapshotPackage,
    OutfitPackageCollection,
  } from "$src/data/common";
  import { LAYER_TYPE, PACKAGE_TYPE } from "$src/data/consts";
  import { GenerateIdForCollection } from "$src/data/firebase";
import { get } from "svelte/store";

  
  export class OutfitPackageInstanceConfig {
    sourcePath: string;
    isMerged: boolean;
    generateSnapshot: boolean;
    layerCountfromLink: number;
    parser: (x: OutfitPackage) => Promise<OutfitPackage>;
    layerParser: (x: OutfitLayer) => Promise<OutfitLayer>;
    layerParserLocal: (x: OutfitLayer) => Promise<OutfitLayer>;
    parserLocal: (x: OutfitPackage) => Promise<OutfitPackage>;
    snapshotParser: (
      p: OutfitLayer[],
      x: OutfitPackage
    ) => Promise<OutfitPackageSnapshotPackage>;
    snapshotParserLocal: (
      y: OutfitLayer[],
      x: OutfitPackage
    ) => Promise<OutfitPackage>;
    newPackage: () => Promise<OutfitPackage> | OutfitPackage;
    constructor() {}
  }
  class OutfitPackageInstanceClass {
    generateId: () => string;
    upload: (data: OutfitPackage, isNew?: boolean) => Promise<string>;
    fetch: (
      id: string,
      layers?: any,
      model?: string,
      fetchSnapshot?: boolean
    ) => Promise<OutfitPackage>;
    create: (addToWardrobe?: boolean, isShared?: boolean) => Promise<OutfitPackage>;
    delete: (id: string) => Promise<void>;
    uploadLayer: (pack: OutfitPackage, layer: OutfitLayer) => Promise<void>;
    removeLayer: (id: string, layerId: string) => Promise<void>;
    fetchFromLink: (link: OutfitPackageLink) => Promise<OutfitPackage>;
  }
  export const OutfitPackageInstance = function (
    config: OutfitPackageInstanceConfig
  ) {
    let _self= new OutfitPackageInstanceClass();
    let _config = config;
  
    _self.generateId = () => GenerateIdForCollection(_config.sourcePath);
    _self.upload = async function (data: OutfitPackage, isNew = false) {
      return await UploadPackage(
        data,
        _config.sourcePath,
        _config.parser,
        isNew,
        _config.generateSnapshot,
        _config.snapshotParser
      );
    };
    _self.fetch = async function (
      id: string,
      layers: any = -1,
      model?: string,
      fetchSnapshot = false
    ) {
      let parsed = (await FetchPackage(
        _config.sourcePath,
        id,
        _config.parserLocal,
        layers,
        fetchSnapshot,
        _config.snapshotParserLocal
      )) as OutfitPackage;
      if (parsed == null) return null;
      parsed.model = model || parsed.model;
      return parsed;
    };
    _self.create = async function (
      addToWardrobe: boolean = false,
      isShared: boolean = false
    ) {
      let pack = await _config.newPackage();
      pack.id = _self.generateId();
      if (isShared) pack.isShared = true;
      if (addToWardrobe) await _addItemToWardrobe(pack);
      return pack;
    };
    _self.delete = async function (id: string) {
      return await DeletePackage(_config.sourcePath, id);
    };
    _self.uploadLayer = async function (pack: OutfitPackage, layer: OutfitLayer) {
      if (layer.type == LAYER_TYPE.LOCAL) {
        await UploadPackageLayer(
          pack,
          layer,
          _config.sourcePath,
          _config.layerParser,
          _config.generateSnapshot,
          _config.snapshotParser
        );
      }
    };
    _self.removeLayer = async function (id: string, layerId: string) {
      return await DeletePackageLayer(
        id,
        layerId,
        _config.sourcePath,
        _config.generateSnapshot
      );
    };
    _self.fetchFromLink = async function (link: OutfitPackageLink) {
      return await _self.fetch(
        link.id,
        link.variantId || _config.layerCountfromLink,
        link.model,
        _config.generateSnapshot
      );
    };
    return _self;
  };
  

  const _addItemToWardrobe = function (
    item: OutfitPackage | OutfitPackageCollection
  ) {
    let wardrobeObj = get(wardrobe);
    if (!_isItemInWardrobe(item, wardrobeObj)) {
      AddLike(item.id, item.type);
    }
    if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
      wardrobeObj.sets.push(item as OutfitPackage);
    }
    if (item.type == PACKAGE_TYPE.OUTFIT) {
      wardrobeObj.outfits.push(item as OutfitPackage);
    }
    if(item.type == PACKAGE_TYPE.OUTFIT_COLLECTION){
      wardrobeObj.collections.push(item as OutfitPackageCollection);
    }
    wardrobe.set(wardrobeObj);
    return true;
  };
 const  _isItemInWardrobe = function (item, wardrobe) {
    if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
      return wardrobe.sets.some((set) => set.id == item.id);
    }
    if (item.type == PACKAGE_TYPE.OUTFIT) {
      return wardrobe.outfits.some((outfit) => outfit.id == item.id);
    }
    if(item.type == PACKAGE_TYPE.OUTFIT_COLLECTION){
      return wardrobe.collections.some((collection) => collection.id == item.id);
    }
    return false;
  };