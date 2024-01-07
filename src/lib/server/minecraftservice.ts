import { MODEL_TYPE } from "../../data/consts";
import { authenticateWithPrismarine } from "./prismarineAuth";
export const ChangeSkin = async function (id: string, model: string) {
  const token = await authenticate();
  let normalizedModel;
  if (model == MODEL_TYPE.ALEX) {
    normalizedModel = "slim";
  } else {
    normalizedModel = "classic";
  }
  const url = "https://minerobe.vercel.app/api/outfit_set_flat/" + id + "/" + model;
  const request = {
    variant: normalizedModel,
    url: url,
  };
  console.log(token,request);
  const result = await fetch("https://api.minecraftservices.com/minecraft/profile/skins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(request),
  });
  //console.log(result);
};
const authenticate = async function () {
  const data= await authenticateWithPrismarine();
 return data.token.token;
};