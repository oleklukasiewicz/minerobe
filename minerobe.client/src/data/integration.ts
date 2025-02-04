import { SetCurrentTexture } from "$src/api/settings";
import { OutfitPackageRenderConfig } from "./models/render";

export const SetMinecraftSkin = async (
  configuration: OutfitPackageRenderConfig
): Promise<any> => {
  const currentTextureConfig = configuration.ToExportConfig();
  return await SetCurrentTexture(currentTextureConfig);
};
