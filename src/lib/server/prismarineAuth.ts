import { Authflow } from "prismarine-auth";
import { GetSecret, SetSecret, UpdateDocument } from "./firebaseServer";
const getCacheNameForUser = (user) =>
  import.meta.env.VITE_USERS_SECRET_PATH +
  "/" +
  user +
  "/" +
  import.meta.env.VITE_USERS_SECRET_LOCAL_PATH;

export const authenticateWithPrismarine = async function (user, token) {
  let authPromise: Promise<any> = new Promise((resolve, reject) => {
    const flow = new Authflow(
      import.meta.env.VITE_AZURE_APP_ID,
      cacheFactory,
      { flow: "msal" },
      async (params: any) => {
        resolve({
          requireUserInteraction: true,
          params: {
            userCode: params.userCode,
            verificationUri: params.verificationUri,
            expiresIn: params.expiresIn,
          },
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
              id: tokenAcc.profile.id,
              name: tokenAcc.profile.name,
              skins: tokenAcc.profile.skins,
            },
          },
          token
        );
        resolve({
          requireUserInteraction: false,
          profile: {
            id: tokenAcc.profile.id,
            name: tokenAcc.profile.name,
            skins: tokenAcc.profile.skins,
          },
          token: tokenAcc.token,
        });
      });
  });
  function InMemoryCache(user, userToken) {
    const id = user;
    const token = userToken;
    return {
      async getCached() {
        const cache = await GetSecret(getCacheNameForUser(id), id, token, user);
        return cache || {};
      },
      async setCached(value) {
        const cache = await SetSecret(
          getCacheNameForUser(id),
          id,
          value,
          token
        );
      },
      async setCachedPartial(value) {
        const cacheref = await GetSecret(
          getCacheNameForUser(id),
          id,
          token,
          user
        );
        const cache = await SetSecret(
          getCacheNameForUser(id),
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
  const cache = await SetSecret(getCacheNameForUser(id), id, {}, token);
  await UpdateDocument(
    "settings",
    id,
    {
      linkedMinecraftAccount: null,
    },
    token
  );
};
