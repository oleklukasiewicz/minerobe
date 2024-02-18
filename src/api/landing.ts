import { OutfitPackageLink, type LandingPageData } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { GetDocument } from "$src/data/firebase";
import { FetchOutfitFromLink } from "./outfits";
import { FetchOutfitSetFromLink } from "./sets";


export const FetchLandingPage = async () => {
  const obj = (await GetDocument("public", "landing")) as LandingPageData;
  const mostLikedpackages = [];
  const mostDownloadedpackages = [];
  const mostrecentpackages = [];
  await Promise.all(
    obj.mostLiked.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
        mostLikedpackages.push(await FetchOutfitSetFromLink(link));
      else mostLikedpackages.push(await FetchOutfitFromLink(link));
    })
  );
  await Promise.all(
    obj.mostDownloaded.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
      mostDownloadedpackages.push(await FetchOutfitSetFromLink(link));
      else mostDownloadedpackages.push(await FetchOutfitFromLink(link));
    })
  );
  await Promise.all(
    obj.mostRecent.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
      mostrecentpackages.push(await FetchOutfitSetFromLink(link));
      else mostrecentpackages.push(await FetchOutfitFromLink(link));
    })
  );
  obj.mostRecent = mostrecentpackages.filter((item) => item != null);
  obj.mostLiked = mostLikedpackages.filter((item) => item != null);
  obj.mostDownloaded = mostDownloadedpackages.filter((item) => item != null);
  return obj;
};
