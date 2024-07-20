import { GetRequest } from "$src/data/api";

export const LinkAccount = async function () {
    const res = await GetRequest("/api/JavaXboxAuth/Link" );
    return res;
}
export const GetAccount = async function () {
    const res = await GetRequest("/api/JavaXboxAuth/Profile" );
    return res;
}
export const GetFullAccount = async function () {
    const res = await GetRequest("/api/JavaXboxAuth/FullProfile" );
    return res;
}
export const UnLinkAccount = async function () {
    const res = await GetRequest("/api/JavaXboxAuth/UnLink" );
    return res;
}