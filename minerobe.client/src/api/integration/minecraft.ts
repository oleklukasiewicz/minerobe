import { GetRequest } from "$src/data/api";

export const LinkAccount = async function (abortController = null) {
    const res = await GetRequest("/api/JavaXboxAuth/Link",abortController );
    return res;
}
export const GetAccount = async function (keepFresh = true) {
    const res = await GetRequest(`/api/JavaXboxAuth/Profile?keepFresh=${keepFresh}` );
    return res;
}
export const GetFullAccount = async function (keepFresh = true) {
    const res = await GetRequest(`/api/JavaXboxAuth/FullProfile?keepFresh=${keepFresh}` );
    return res;
}
export const RefreshAccount = async function () {
    const res = await GetRequest("/api/JavaXboxAuth/RefreshProfile" );
    return res;
}
export const UnLinkAccount = async function () {
    const res = await GetRequest("/api/JavaXboxAuth/UnLink" );
    return res;
}