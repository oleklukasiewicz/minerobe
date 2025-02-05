import { GetRequest } from "$src/data/api";
import type { MinecraftAccount, MinecraftAccountSimple } from "$src/data/models/integration/minecraft";

export const LinkAccount = async function (abortController = null) {
    const res = await GetRequest("/api/JavaXboxAuth/Link",abortController );
    return res;
}
export const GetAccount = async function (keepFresh = true):Promise<MinecraftAccountSimple> {
    const res = await GetRequest(`/api/JavaXboxAuth/Profile?keepFresh=${keepFresh}` );
    return res;
}
export const GetFullAccount = async function (keepFresh = true):Promise<MinecraftAccount> {
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