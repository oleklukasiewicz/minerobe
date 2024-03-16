import auth from "prismarine-auth";
const { Authflow, Titles } = auth;
import { GetSecret, SetSecret, UpdateDocument } from "./firebaseServer";
import { pusherServer } from "./socketService";
const getCacheNameForUser = (user) =>
  import.meta.env.VITE_USERS_SECRET_PATH +
  "/" +
  user +
  "/" +
  import.meta.env.VITE_USERS_SECRET_LOCAL_PATH;

export const authenticateWithPrismarine = async function (user, token) {
  let authPromise: Promise<any> = new Promise(async (resolve, reject) => {
    const flow = new Authflow(
      import.meta.env.VITE_AZURE_APP_ID,
      cacheFactory,
      { flow: "sisu", authTitle: Titles.MinecraftJava, deviceType: "Win32" },
      async (params: any) => {
        resolve({
          requireUserInteraction: true,
          params: {
            userCode: params.user_code,
            verificationUri: params.verification_uri,
            expiresIn: params.expires_in,
          },
        });
      }
    );
    const tokenAcc = await flow.getMinecraftJavaToken({ fetchProfile: true });
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
    await emitAuthFinished(user);
    //send event to client
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
const emitAuthFinished = async function (userId) {
  await pusherServer.trigger(userId, "authFinished", {});
};
