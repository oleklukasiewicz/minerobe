import { Authflow } from "prismarine-auth";

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
export const refreshWithPrismarine = async function () {};
class InMemoryCache {
  private cache = {}
  async getCached () {
    return this.cache
  }
  async setCached (value) {
    this.cache = value
  }
  async setCachedPartial (value) {
    this.cache = {
      ...this.cache,
      ...value
    }
  }
}

function cacheFactory ({ username, cacheName }) {
  return new InMemoryCache()
}