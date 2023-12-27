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
  switch (type) {
    case OUTFIT_TYPE.HAT:
      cameraOptions.lookAt = new THREE.Vector3(0, 0.8, 0);
      izometricvalue = 100;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.HOODIE:
      cameraOptions.lookAt = new THREE.Vector3(0, 0.4, 0);
      cameraOptions.fov = 1.35;
      izometricvalue = 100;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.TOP:
      cameraOptions.lookAt = new THREE.Vector3(0, 0.2, 0);
      cameraOptions.fov = 1.5;
      izometricvalue = 100;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.BOTTOM:
      cameraOptions.lookAt = new THREE.Vector3(0, -0.5, 0);
      izometricvalue = 1.2;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.SHOES:
      cameraOptions.lookAt = new THREE.Vector3(0, -1, 0);
      izometricvalue = 0.9;
      cameraOptions.position = {
        x: -1 * izometricvalue,
        y: izometricvalue,
        z: -1 * izometricvalue,
      };
      break;
    case OUTFIT_TYPE.SUIT:
      cameraOptions.lookAt = new THREE.Vector3(0, 0, 0);
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
      cameraOptions.lookAt = new THREE.Vector3(0, 0, 0);
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
