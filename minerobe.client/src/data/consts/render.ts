import { CameraConfig } from "$src/data/render";
import * as THREE from "three";

const angle = 0.5958;

export const CAMERA_CONFIG = {
  set: new CameraConfig(
    new THREE.Vector3(-1, 0.42 + angle, -1),
    new THREE.Vector3(0, 0.042, 0),
    0.91
  ),
  top: new CameraConfig(
    new THREE.Vector3(-1, 0.1 + angle, -1),
    new THREE.Vector3(0, 0.1, 0),
    1.5
  ),
  bottom: new CameraConfig(
    new THREE.Vector3(-1, -0.5 + angle, -1),
    new THREE.Vector3(0, -0.5, 0),
    1.8
  ),
  shoes: new CameraConfig(
    new THREE.Vector3(-1, -0.9 + angle, -1),
    new THREE.Vector3(0, -0.9, 0),
    2
  ),
  hat: new CameraConfig(
    new THREE.Vector3(-1, 0.8 + angle, -1),
    new THREE.Vector3(0, 0.8, 0),
    1.7
  ),
  hoodie: new CameraConfig(
    new THREE.Vector3(-1, 0.45 + angle, -1),
    new THREE.Vector3(0, 0.45, 0),
    1.3
  ),
};
