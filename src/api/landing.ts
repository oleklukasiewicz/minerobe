import {
  OutfitPackageLink,
  type LandingPageData,
  type OutfitLayerLink,
} from "$src/data/common";
import { MODEL_TYPE, OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import { GetDocument } from "$src/data/firebase";
import { FetchOutfitSnapshotFromLink } from "./outfits";
import { FetchOutfitSetSnapshotFromLink } from "./sets";

export const FetchLandingPage = async () => {
  const obj = (await GetDocument("public", "landing")) as LandingPageData;
  const mostLikedpackages = [];
  await Promise.all(
    obj.mostLiked.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
        mostLikedpackages.push(await FetchOutfitSetSnapshotFromLink(link));
      else mostLikedpackages.push(await FetchOutfitSnapshotFromLink(link));
    })
  );
  obj.mostLiked = mostLikedpackages;
  return obj;
};
