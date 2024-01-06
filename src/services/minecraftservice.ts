import { MODEL_TYPE } from "../data/consts";
export const ChaageSkin = async function (id: string, model: string) {
  let normalizedModel;
  if (model == MODEL_TYPE.ALEX) {
    normalizedModel = "slim";
  } else {
    normalizedModel = "classic";
  }
  const url = "https://minerobe.vercel.app/outfit_set_raw/" + id + "/" + model;
  const request= {
    variant: normalizedModel,
    url: url,
  }
  const result=await fetch("https://api.minecraftservices.com/minecraft/profile/skins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + import.meta.env.VITE_MINECRAFT_TOKEN,
    },
    body: JSON.stringify(request),
  });
};
