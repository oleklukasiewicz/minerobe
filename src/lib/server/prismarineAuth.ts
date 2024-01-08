import { Authflow } from "prismarine-auth";
import { GetDocument, SetDocument, UpdateDocument } from "./firebaseServer";

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
        const cache = await GetDocument("secret", id, token);
        return cache || {};
      },
      async setCached(value) {
        const cache = await SetDocument("secret", id, value, token);
      },
      async setCachedPartial(value) {
        const cacheref = await GetDocument("secret", id, token);
        const cache = await SetDocument(
          "secret",
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
  const cache = await SetDocument("secret", id, {}, token);
  await UpdateDocument(
    "settings",
    id,
    {
      linkedMinecraftAccount: null,
    },
    token
  );
};
