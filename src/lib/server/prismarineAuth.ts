import { Authflow } from "prismarine-auth";
import {GetSecret,SetSecret,UpdateDocument } from "./firebaseServer";
const pathToSecret="secret/"+import.meta.env.VITE_USERS_SECRET_PATH

export const authenticateWithPrismarine = async function (user, token) {
  let authPromise: Promise<any> = new Promise((resolve, reject) => {
    const flow = new Authflow(
      import.meta.env.VITE_AZURE_APP_ID,
      cacheFactory,
      { flow: "msal" },
      async (params) => {
        resolve({
          requireUserInteraction: true,
          params: params,
        });
      }
    );
    flow
      .getMinecraftJavaToken({ fetchProfile: true })
      .then(async (tokenAcc) => {
        await UpdateDocument(
          "settings",
          user,
          {
            linkedMinecraftAccount: {
              ...tokenAcc.profile,
            },
          },
          token
        );
        resolve({
          requireUserInteraction: false,
          token: tokenAcc,
        });
      });
  });
  function InMemoryCache(user, userToken) {
    const id = user;
    const token = userToken;
    return {
      async getCached() {
        const cache = await GetSecret(pathToSecret, id, token,user);
        return cache || {};
      },
      async setCached(value) {
        const cache = await SetSecret(pathToSecret, id, value, token);
      },
      async setCachedPartial(value) {
        const cacheref = await GetSecret(pathToSecret, id, token,user);
        const cache = await SetSecret(
          pathToSecret,
          id,
          { ...value, ...cacheref },
          token
        );
        return null;
      },
    };
  }
  function cacheFactory() {
    return InMemoryCache(user, token);
  }
  return authPromise;
};
export const refreshWithPrismarine = async function (id, token) {
  const cache = await SetSecret(pathToSecret, id, {}, token);
  await UpdateDocument(
    "settings",
    id,
    {
      linkedMinecraftAccount: null,
    },
    token
  );
};
