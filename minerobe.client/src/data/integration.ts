import { OutfitPackageRenderConfig } from "./models/render";

export const SetMinecraftSkin = async (
  configuration: OutfitPackageRenderConfig
): Promise<boolean> => {
  const currentTextureConfig = configuration.ToExportConfig();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 3000);
  });
};
