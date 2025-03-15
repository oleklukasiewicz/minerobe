import { CameraConfig } from "$src/data/render";
import { Vector3 } from "three";

const angle = 0.5958;

export const CAMERA_CONFIG = {
  getForOutfit: (outfitType: string) => {
    const cameraConfig = CAMERA_CONFIG[outfitType];
    if (!cameraConfig) return new CameraConfig();
    return cameraConfig;
  },
  set: new CameraConfig(
    new Vector3(-1, 0 + angle, -1),
    new Vector3(0, 0, 0),
    0.905
  ),
  top: new CameraConfig(
    new Vector3(-1, 0.1 + angle, -1),
    new Vector3(0, 0.1, 0),
    1.5
  ),
  bottom: new CameraConfig(
    new Vector3(-1, -0.54 + angle, -1),
    new Vector3(0, -0.54, 0),
    1.5
  ),
  shoes: new CameraConfig(
    new Vector3(-1, -0.9 + angle, -1),
    new Vector3(0, -0.9, 0),
    2
  ),
  hat: new CameraConfig(
    new Vector3(-1, 0.8 + angle, -1),
    new Vector3(0, 0.8, 0),
    1.7
  ),
  hoodie: new CameraConfig(
    new Vector3(-1, 0.45 + angle, -1),
    new Vector3(0, 0.45, 0),
    1.3
  ),
  suit: new CameraConfig(
    new Vector3(-1, 0 + angle, -1),
    new Vector3(0, 0, 0),
    0.91
  ),
};
