import { Authflow } from "prismarine-auth";

export const authenticateWithPrismarine = async function () {
  let authPromise: Promise<any> = new Promise((resolve, reject) => {
    const flow = new Authflow(
      import.meta.env.VITE_AZURE_APP_ID,
      "/.cache",
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