import { currentUser } from "$src/data/cache";
import { GetDocument, SetDocument ,GenerateIdForCollection} from "$src/data/firebase";
import { get } from "svelte/store";

const WARDROBE_PATH = "wardrobes";
export const GetWardrobe = async function () {
  if (get(currentUser))
    return await GetDocument(WARDROBE_PATH, get(currentUser).uid);
};
export const SetWardrobe = async function (data) {
  if (get(currentUser) && data != null) {
    //convert wardrobe package to object
    const json = JSON.stringify(data);
    return await SetDocument(
      WARDROBE_PATH,
      get(currentUser).uid,
      JSON.parse(json)
    );
  }
};
export const GenerateIdForWardrobeItem = function () {
  return GenerateIdForCollection(WARDROBE_PATH);
};