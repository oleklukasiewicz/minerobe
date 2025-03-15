let three = null;
let orbitalControls = null;
let gltfLoader = null;

export const THREE = {
  getThree: async function () {
    if (three == null) {
      three = await import("three");
    }
    return three;
  },
  getOrbitalControls: async function () {
    if (orbitalControls == null) {
      orbitalControls = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );
    }
    return orbitalControls;
  },
  getGLTFLoader: async function () {
    if (gltfLoader == null) {
      gltfLoader = await import("three/examples/jsm/loaders/GLTFLoader.js");
    }
    return gltfLoader;
  },
};
export class Vector3Min {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}