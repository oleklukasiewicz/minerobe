import { Authflow } from "prismarine-auth";
import { get, writable } from "svelte/store";

const prismarineAuthCache = writable({});

export const authenticateWithPrismarine = async function () {
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
    flow.getMinecraftJavaToken({ fetchProfile: true }).then((token) => {
      resolve({
        requireUserInteraction: false,
        token: token,
      });
    });
  });
  return authPromise;
};
export const refreshWithPrismarine = async function () {
  prismarineAuthCache.set({});
};
//temporary workarount for prismarine auth
class InMemoryCache {
  private cache = {};
  async getCached() {
    return get(prismarineAuthCache);
  }
  async setCached(value) {
    prismarineAuthCache.set(value);
  }
  async setCachedPartial(value) {
    this.cache = {
      ...get(prismarineAuthCache),
      ...value,
    };
    prismarineAuthCache.set(this.cache);
  }
}

function cacheFactory({ username, cacheName }) {
  return new InMemoryCache();
}
