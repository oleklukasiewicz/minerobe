import { SetCurrentTexture } from "$src/api/settings";
import { OutfitPackageRenderConfig } from "./models/render";

export const SetMinecraftSkin = async (
  configuration: OutfitPackageRenderConfig
): Promise<boolean> => {
  const currentTextureConfig = configuration.ToExportConfig();
  return true;
};
