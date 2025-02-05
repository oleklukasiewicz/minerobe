import { GetRequest } from "$src/data/api";
import type { MinecraftAccount, MinecraftSkin } from "$src/data/models/integration/minecraft";

export const LinkAccount = async function (abortController = null) :Promise<MinecraftAccount>{
    const res = await GetRequest("/api/McIntegration/Link",abortController );
    return res;
}
export const GetAccount = async function (keepFresh = true):Promise<MinecraftAccount> {
    const res = await GetRequest(`/api/McIntegration/Profile?keepFresh=${keepFresh}` );
    return res;
}
export const GetCurrentSkin = async function (keepFresh = true):Promise<MinecraftSkin> {
    const res = await GetRequest(`/api/McIntegration/Skin?keepFresh=${keepFresh}` );
    return res;
}
export const RefreshAccount = async function () {
    const res = await GetRequest("/api/McIntegration/RefreshProfile" );
    return res;
}
export const UnLinkAccount = async function () {
    const res = await GetRequest("/api/McIntegration/UnLink" );
    return res;
}