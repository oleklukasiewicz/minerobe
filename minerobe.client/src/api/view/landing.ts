import { PostRequest } from "$src/data/api";
import type { PagedResponse } from "$src/model/base";

export const GetMostRecent = async function (
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest("/api/LandingView/recent", {
    page,
    pageSize,
    filter: {},
  })) as PagedResponse;
  return req;
};
export const GetMostLiked = async function (
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest("/api/LandingView/liked", {
    page,
    pageSize,
    filter: {},
  })) as PagedResponse;
  return req;
};
export const GetMostDownloaded = async function (
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest("/api/LandingView/downloaded", {
    page,
    pageSize,
    filter: {},
  })) as PagedResponse;
  return req;
};
