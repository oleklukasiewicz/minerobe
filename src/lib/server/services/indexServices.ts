import { LandingPageData, OutfitPackageLink } from "$src/data/common";
import { DATA_PATH_CONFIG } from "$src/data/consts";
import {
  BuildCollectionQuery,
  FetchDocsFromQuery,
  QueryOrderBy,
  QueryWhere,
  SetDocumentAnonymous,
} from "$src/data/firebase";

export const IndexLandingPage = async function () {
  const q = await BuildCollectionQuery(
    DATA_PATH_CONFIG.QUERY,
    [
      new QueryWhere("isShared", "==", true),
      new QueryWhere("variantId", "==", "none"),
    ],
    [new QueryOrderBy("likes", "desc")],
    6
  );
  const mostLiked = (await FetchDocsFromQuery([q]))[0] as any[];
  //most downlaoded
  const q2 = await BuildCollectionQuery(
    DATA_PATH_CONFIG.QUERY,
    [
      new QueryWhere("isShared", "==", true),
      new QueryWhere("variantId", "==", "none"),
    ],
    [new QueryOrderBy("downloads", "desc")],
    6
  );
  const mostDownloaded = (await FetchDocsFromQuery([q2]))[0] as any[];

  const q3 = await BuildCollectionQuery(
    DATA_PATH_CONFIG.QUERY,
    [
      new QueryWhere("isShared", "==", true),
      new QueryWhere("isFeatured", "==", true),
      new QueryWhere("variantId", "==", "none"),
    ],
    [new QueryOrderBy("createdAt", "desc")],
    6
  );
  const mostRecent = (await FetchDocsFromQuery([q3]))[0] as any[];

  const landingPage = new LandingPageData(
    new Date(),
    "banner",
    [],
    mostLiked.map((d) => new OutfitPackageLink(d.id, d.model, d.type)) || [],
    mostDownloaded.map((d) => new OutfitPackageLink(d.id, d.model, d.type)) ||
      [],
    mostRecent.map((d) => new OutfitPackageLink(d.id, d.model, d.type)) || []
  );
  await SetDocumentAnonymous("public", "landing", landingPage);
  
  return landingPage;
};
