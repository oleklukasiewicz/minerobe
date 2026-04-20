import { PostRequest } from "$src/data/api";
import type { PagedModel, PagedResponse } from "$src/data/models/base";
import type { ExploreOutfitFilter } from "$src/data/models/filter";
import type { OutfitPackage } from "$src/data/models/package";

export const GetExploreOutfits = async function (
  pagedModel: PagedModel<ExploreOutfitFilter>,
  abortController = null
) {
  const req = (await PostRequest(
    "/api/ExploreView/outfit",
    {
      page: pagedModel.page,
      pageSize: pagedModel.pageSize,
      filter: pagedModel.filter,
      sort: pagedModel.sort,
    },
    abortController
  )) as PagedResponse<OutfitPackage>;
  return req;
};