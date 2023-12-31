import { OutfitPackageLink, type LandingPageData } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { GetDocument } from "$src/data/firebase";
import { FetchOutfitSnapshotFromLink } from "./outfits";
import { FetchOutfitSetSnapshotFromLink } from "./sets";

export const FetchLandingPage = async () => {
  const obj = (await GetDocument("public", "landing")) as LandingPageData;
  const mostLikedpackages = [];
  const mostDownloadedpackages = [];
  await Promise.all(
    obj.mostLiked.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
        mostLikedpackages.push(await FetchOutfitSetSnapshotFromLink(link));
      else mostLikedpackages.push(await FetchOutfitSnapshotFromLink(link));
    })
  );
  await Promise.all(
    obj.mostDownloaded.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
      mostDownloadedpackages.push(await FetchOutfitSetSnapshotFromLink(link));
      else mostDownloadedpackages.push(await FetchOutfitSnapshotFromLink(link));
    })
  );
  obj.mostLiked = mostLikedpackages.filter((item) => item != null);
  obj.mostDownloaded = mostDownloadedpackages.filter((item) => item != null);
  return obj;
};
