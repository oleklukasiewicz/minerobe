import { MODEL_TYPE } from "$data/consts";
import { serverConfig } from "$src/data/config";
import { FetchOutfitSetSnapshot, GetWardrobeSets } from "./firebaseServer";
import {
  authenticateWithPrismarine,
  linkAccountWithPrismarine,
  unLinkAccountWithPrismarine,
} from "./prismarineAuth";
export const ChangeSkin = async function (
  id: string,
  model: string,
  userId: string,
  userToken: string
) {
  try {
    const data = await authenticateWithPrismarine(userId, userToken);
    const token = data?.token;
    if (token == null) throw new Error("Invalid token");
    let normalizedModel = model == MODEL_TYPE.ALEX ? "slim" : "classic";
    const url =
      serverConfig.minecraftServices.photoBaseUrl + userId + "/" + model;
    const request = {
      variant: normalizedModel,
      url: url,
    };
    const result = await fetch(
      "https://api.minecraftservices.com/minecraft/profile/skins",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(request),
      }
    );
    console.log(
      "Change skin result ",
      userId,
      result.status != 200 ? await result.json() : "result: ok",
      JSON.stringify(request)
    );
    return result.status == 200;
  } catch (e) {
    return false;
  }
};

export const LinkAccount = async function (user: string, token: string) {
  // steps:
  
  // Auth With Prismarine
  // save in db
  var authResp = await linkAccountWithPrismarine(user, token);

  // compare skin with wardobe -> if match -> set as current
  const sets = await GetWardrobeSets(user, token);
  sets.forEach(async (set) => {
    const setC= await FetchOutfitSetSnapshot(user, token, set.id);
    


  });

  return authResp;
};
export const UnLinkAccount = async function (user: string, token: string) {
  var unlinkRep = await unLinkAccountWithPrismarine(user, token);
  return unlinkRep;
};
