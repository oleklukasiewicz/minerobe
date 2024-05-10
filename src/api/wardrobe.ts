import { DeleteRequest, PostRequest } from "$src/data/api";
import { currentUser } from "$src/data/cache";
import { get } from "svelte/store";

export const AddPackageToWardrobe = async function (packageId: string) {
  const resp = await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.id + "/" + packageId + "/byUser",
    {}
  );
  return resp;
};
export const RemovePackageFromWardrobe = async function (packageId: string) {
  const resp = await DeleteRequest(
    "/api/Wardrobe/" + get(currentUser)?.id + "/" + packageId + "/byUser"
  );
  return resp;
};
