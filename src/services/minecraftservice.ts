import { OAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { MODEL_TYPE } from "../data/consts";
import { MicrosoftAuthenticator } from "@xmcl/user";
export const ChangeSkin = async function (id: string, model: string) {
  const token = await authenticate();
  let normalizedModel;
  if (model == MODEL_TYPE.ALEX) {
    normalizedModel = "slim";
  } else {
    normalizedModel = "classic";
  }
  const url = "https://minerobe.vercel.app/outfit_set_raw/" + id + "/" + model;
  const request = {
    variant: normalizedModel,
    url: url,
  };
  const result = await fetch("/mcskinapi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(request),
  });
  console.log(result);
};
const authenticate = async function () {
  const provider: any = new OAuthProvider("microsoft.com");
  const result: any = await signInWithPopup(getAuth(), provider);

  const credential = OAuthProvider.credentialFromResult(result);
  const token = credential.accessToken;
  const idToken = credential.idToken;

  console.log(token);
  const auth = new MicrosoftAuthenticator();
  const { liveXstsResponse, minecraftXstsResponse } =
    await auth.acquireXBoxToken(token);

  // You can use liveXstsResponse to get the xbox user avatar and name.
  const xboxGameProfile = await auth.getXboxGameProfile(
    liveXstsResponse.DisplayClaims.xui[0].xid,
    liveXstsResponse.DisplayClaims.xui[0].uhs,
    liveXstsResponse.Token
  );

  // you can use the xstsResponse to get the minecraft access token
  const mcResponse = await auth.loginMinecraftWithXBox(
    minecraftXstsResponse.DisplayClaims.xui[0].uhs,
    minecraftXstsResponse.Token
  );

  // the accessToken is the common minecraft token we want!
  const accessToken: string = mcResponse.access_token;
  const username = mcResponse.username;
  const expire = mcResponse.expires_in; // in seconds
  console.log(accessToken);
};
