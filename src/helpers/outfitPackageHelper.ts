import {
  DeletePackage,
  DeletePackageLayer,
  FetchPackage,
  UploadPackage,
  UploadPackageLayer,
} from "$src/api/pack";
import {
  OutfitPackage,
  type OutfitLayer,
  type OutfitPackageLink,
  type OutfitPackageSnapshotPackage,
} from "$src/data/common";
import { LAYER_TYPE } from "$src/data/consts";
import { GenerateIdForCollection } from "$src/data/firebase";

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
export class OutfitPackageInstance {
  private _self;
  private _config: OutfitPackageInstanceConfig;

  constructor(config: OutfitPackageInstanceConfig) {
    this._self = this;
    this._config = config;
  }
  generateId = () => GenerateIdForCollection(this._config.sourcePath);
  generateLayerId = () => GenerateIdForCollection("dummy");
  async upload(data: OutfitPackage, isNew = false) {
    return await UploadPackage(
      data,
      this._config.sourcePath,
      this._config.parser,
      isNew,
      this._config.generateSnapshot,
      this._config.snapshotParser
    );
  }

  async fetch(
    id: string,
    layers: any = -1,
    model?: string,
    fetchSnapshot = false
  ) {
    let parsed = (await FetchPackage(
      this._config.sourcePath,
      id,
      this._config.parserLocal,
      layers,
      fetchSnapshot,
      this._config.snapshotParserLocal
    )) as OutfitPackage;
    if (parsed == null) return null;
    parsed.model = model || parsed.model;
    return parsed;
  }

  async create(
    addToWardrobe: boolean = false,
    isShared: boolean = false
  ) {
    let pack = await this._config.newPackage();
    pack.id = this._self.generateId();
    if (isShared) pack.isShared = true;
    //if (addToWardrobe) await _addItemToWardrobe(pack);
    await this.upload(pack, true);
    return pack;
  }

  async delete(id: string) {
    return await DeletePackage(this._config.sourcePath, id);
  }

  async uploadLayer(pack: OutfitPackage, layer: OutfitLayer) {
    if (layer.type == LAYER_TYPE.LOCAL) {
      await UploadPackageLayer(
        pack,
        layer,
        this._config.sourcePath,
        this._config.layerParser,
        this._config.generateSnapshot,
        this._config.snapshotParser
      );
    }
  }

  async removeLayer(id: string, layerId: string) {
    return await DeletePackageLayer(
      id,
      layerId,
      this._config.sourcePath,
      this._config.generateSnapshot
    );
  }

  async fetchFromLink(link: OutfitPackageLink) {
    return await this.fetch(
      link.id,
      link.variantId || this._config.layerCountfromLink,
      link.model,
      this._config.generateSnapshot
    );
  }
}