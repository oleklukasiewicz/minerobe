import { MODEL_TYPE } from "../../data/consts";
import { authenticateWithPrismarine } from "./prismarineAuth";
export const ChangeSkin = async function (id: string, model: string,userId:string,userToken:string) {
  const token = await authenticate(userId,userToken);
  if(token==null) throw new Error("Invalid token");
  let normalizedModel;
  if (model == MODEL_TYPE.ALEX) {
    normalizedModel = "slim";
  } else {
    normalizedModel = "classic";
  }
  const url = "https://minerobe.vercel.app/api/outfit_set_flat/" + userId + "/" + model;
  console.log(url);
  const request = {
    variant: normalizedModel,
    url: url,
  };
  const result = await fetch("https://api.minecraftservices.com/minecraft/profile/skins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(request),
  });
};
const authenticate = async function (user,token:string) {
  const data= await authenticateWithPrismarine(user,token);
 return data?.token?.token;
};