import { CameraConfig } from "$src/data/render";
import * as THREE from "three";

export const CAMERA_CONFIG_FRONT = new CameraConfig(
  1.5,
  new THREE.Vector3(0, 0.2, -10),
  new THREE.Vector3(0, 0.2, 0),
  true
);
export const CAMERA_CONFIG_BACK = new CameraConfig(
  1.5,
  new THREE.Vector3(0, 0.2, 10),
  new THREE.Vector3(0, 0.2, 0),
  true
);
export const CAMERA_CONFIG_SIDE = new CameraConfig(
  1.5,
  new THREE.Vector3(105, 0.2, -10),
  new THREE.Vector3(0, 0.2, 0),
  true
);
export const CAMERA_CONFIG_SIDE_IZO = new CameraConfig(
  1.5,
  new THREE.Vector3(-15, 0.2, -10),
  new THREE.Vector3(0, 0.2, 0),
  true
);
export const CAMERA_CONFIG_SIDE_IZO2 = new CameraConfig(
  1.5,
  new THREE.Vector3(15, 0.2, -10),
  new THREE.Vector3(0, 0.2, 0),
  true
);
