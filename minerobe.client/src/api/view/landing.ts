import { PostRequest } from "$src/data/api";
import type { PagedResponse } from "$data/models/base";
import type { OutfitPackage } from "$data/models/package";

export const GetMostRecent = async function (
  page: number = 0,
  pageSize: number = 8
) {
  const req = (await PostRequest("/api/LandingView/recent", {
    page,
    pageSize,
    filter: {},
  })) as PagedResponse<OutfitPackage>;
  return req;
};
export const GetMostLiked = async function (
  page: number = 0,
  pageSize: number = 8
) {
  const req = (await PostRequest("/api/LandingView/liked", {
    page,
    pageSize,
    filter: {},
  })) as PagedResponse<OutfitPackage>;
  return req;
};
export const GetMostDownloaded = async function (
  page: number = 0,
  pageSize: number = 8
) {
  const req = (await PostRequest("/api/LandingView/downloaded", {
    page,
    pageSize,
    filter: {},
  })) as PagedResponse<OutfitPackage>;
  return req;
};
