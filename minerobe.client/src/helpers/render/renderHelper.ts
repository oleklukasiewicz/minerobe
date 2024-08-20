import { OUTFIT_TYPE } from "$src/data/consts";
import { CameraConfig } from "$src/data/render";
import * as THREE from "three";

export const GetCameraConfigForType = function (type: string): CameraConfig {
  let cameraOptions: CameraConfig = new CameraConfig();
  cameraOptions.fov = 1.5;
  let izometricvalue = 0.6;
  cameraOptions.position = {
    x: -1 * izometricvalue,
    y: izometricvalue,
    z: -1 * izometricvalue,
  };
  cameraOptions.lookAtEnabled = true;
  cameraOptions.lookAt = new THREE.Vector3(0,GetCameraYCoordsForType(type), 0);
  switch (type) {
    case OUTFIT_TYPE.HAT:
      izometricvalue = 100;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.HOODIE:
      cameraOptions.fov = 1.35;
      izometricvalue = 100;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.TOP:
      cameraOptions.fov = 1.5;
      izometricvalue = 100;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.BOTTOM:
      izometricvalue = 1.2;
      cameraOptions.fov = 1.7;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.SHOES:
      izometricvalue = 4;
      cameraOptions.fov=2
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.SUIT:
      cameraOptions.fov = 0.9;
      izometricvalue = 100;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.OUTFIT_SET:
      cameraOptions.position = { x: -0.7, y: 0.3, z: -0.7 };
      cameraOptions.fov = 0.9;
      cameraOptions.lookAtEnabled = true;
      break;
    case OUTFIT_TYPE.DEFAULT:
      break;
    default:
      break;
  }
  return cameraOptions;
};
export const GetCameraYCoordsForType = function (type: string): number {
  let y = 0;
  switch (type) {
    case OUTFIT_TYPE.HAT:
      y = 0.8;
      break;
    case OUTFIT_TYPE.HOODIE:
      y = 0.4;
      break;
    case OUTFIT_TYPE.TOP:
      y = 0.2;
      break;
    case OUTFIT_TYPE.BOTTOM:
      y = -0.5;
      break;
    case OUTFIT_TYPE.SHOES:
      y = -0.8;
      break;
    case OUTFIT_TYPE.SUIT:
      y = 0;
      break;
    case OUTFIT_TYPE.OUTFIT_SET:
      y = 0.05;
      break;
    case OUTFIT_TYPE.DEFAULT:
      break;
    default:
      break;
  }
  return y;
}