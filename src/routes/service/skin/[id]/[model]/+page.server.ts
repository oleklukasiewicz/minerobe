import { ChangeSkin } from "$lib/server/minecraftservice";

export const load = (async (params) => {

    await ChangeSkin(params.params.id, params.params.model)
    return {};
});