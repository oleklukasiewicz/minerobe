import { PACKAGE_TYPE } from "$src/data/enums/outfit";

export class PhraseFilter {
  phrase: string;
}
export class OutfitFilter extends PhraseFilter {
  type: string;
  outfitType: string[];
  colors: string[];
  isShared: boolean;
  constructor() {
    super();
    this.type = PACKAGE_TYPE.OUTFIT;
    this.outfitType = [];
    this.colors = [];
    this.isShared = null;
    this.phrase = "";
  }
}
export class ExploreOutfitFilter extends PhraseFilter {
  type: string;
  outfitType: string[];
  colors: string[];
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
  constructor() {
    super();
    this.type = null;
    this.outfitType = [];
    this.colors = [];
    this.isFeatured = false;
    this.isNew = false;
    this.isPopular = false;
    this.phrase = "";
  }
}
