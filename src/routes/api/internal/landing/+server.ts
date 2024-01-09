import {
  LandingPageData,
  OutfitPackageLink,
} from "$src/data/common";
import {
  BuildCollectionQuery,
  FetchDocsFromQuery,
  QueryOrderBy,
  QueryWhere,
  SetDocumentAnonymous,
} from "$src/data/firebase";

export const GET = async (event) => {
  const request = event.request;
  // const authHeader = request.headers.get("authorization");
  // if (
  //   authHeader !== `Bearer ${import.meta.env.CRON_SECRET}` &&
  //   authHeader !== `Bearer ${import.meta.env.VITE_CRON_SECRET}`
  // ) {
  //   return new Response("Unauthorized", {
  //     status: 401,
  //   });
  // }

  //most liked
  const q = await BuildCollectionQuery(
    "query",
    [
      new QueryWhere("isShared", "==", true),
      new QueryWhere("variantId", "==", "none"),
    ],
    [new QueryOrderBy("likes", "desc")],
    100
  );
  const mostLiked = (await FetchDocsFromQuery([q]))[0] as any[];
  //most downlaoded
  const q2 = await BuildCollectionQuery(
    "query",
    [
      new QueryWhere("isShared", "==", true),
      new QueryWhere("variantId", "==", "none"),
    ],
    [new QueryOrderBy("downloads", "desc")],
    100
  );
  const mostDownloaded = (await FetchDocsFromQuery([q2]))[0] as any[];

  const q3 = await BuildCollectionQuery(
    "query",
    [
      new QueryWhere("isShared", "==", true),
      new QueryWhere("variantId", "==", "none"),
    ],
    [new QueryOrderBy("createdAt", "desc")],
    100
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
  return new Response(
    "Generated new landing page at: " + landingPage.createdAt,
    { status: 200 }
  );
};
