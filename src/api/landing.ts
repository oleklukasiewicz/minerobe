import { OutfitPackageLink, type LandingPageData } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { GetDocument } from "$src/data/firebase";
import { outfitsInstance } from "./outfits";
import { setsIntance } from "./sets";


export const FetchLandingPage = async () => {
  const obj = (await GetDocument("public", "landing")) as LandingPageData;
  const mostLikedpackages = [];
  const mostDownloadedpackages = [];
  const mostrecentpackages = [];
  await Promise.all(
    obj.mostLiked.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
        mostLikedpackages.push(await setsIntance.fetchFromLink(link));
      else mostLikedpackages.push(await outfitsInstance.fetchFromLink(link));
    })
  );
  await Promise.all(
    obj.mostDownloaded.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
      mostDownloadedpackages.push(await setsIntance.fetchFromLink(link));
      else mostDownloadedpackages.push(await outfitsInstance.fetchFromLink(link));
    })
  );
  await Promise.all(
    obj.mostRecent.map(async (o) => {
      const link: OutfitPackageLink = o;
      if (link.type == PACKAGE_TYPE.OUTFIT_SET)
      mostrecentpackages.push(await setsIntance.fetchFromLink(link));
      else mostrecentpackages.push(await outfitsInstance.fetchFromLink(link));
    })
  );
  obj.mostRecent = mostrecentpackages.filter((item) => item != null);
  obj.mostLiked = mostLikedpackages.filter((item) => item != null);
  obj.mostDownloaded = mostDownloadedpackages.filter((item) => item != null);
  return obj;
};
