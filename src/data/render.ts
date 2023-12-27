import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
export class CameraConfig {
  rotation: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  position: THREE.Vector3 = new THREE.Vector3(0, 0.05, 1);
  lookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  lookAtEnabled: boolean = false;
  fov: number = 75;
}

export class RenderSnapshot {
  cameraOptions: CameraConfig = new CameraConfig();
  texture: any;
  provider: RenderProvider;
  node: any;
  tempNode: any;
}
export class RenderProvider {
  renderer: any;
  scene: any;
  camera: any;
  textureLoader: any;
}
export const RenderFromSnapshot = async function (snapshot: RenderSnapshot) {
  let camera = snapshot.provider.camera;
  let cameraOptions = snapshot.cameraOptions;
  let scene = snapshot.provider.scene;
  let renderer = snapshot.provider.renderer;
  let node = snapshot.node;
  let tempNode = snapshot.tempNode;
  let textureLoader = snapshot.provider.textureLoader;
  let texture = snapshot.texture;

  camera.position.x = cameraOptions.position.x;
  camera.position.y = cameraOptions.position.y;
  camera.position.z = cameraOptions.position.z;
  camera.rotation.x = cameraOptions.rotation.x;
  camera.rotation.y = cameraOptions.rotation.y;
  camera.rotation.z = cameraOptions.rotation.z;
  if (cameraOptions.fov) {
    camera.zoom = cameraOptions.fov;
    camera.updateProjectionMatrix(); // Necessary after changing fov
  }
  if (cameraOptions.lookAtEnabled) {
    camera.lookAt(cameraOptions.lookAt);
  }

  const loadedTexture: any = await new Promise((resolve) => {
    textureLoader.load(texture, (texture) => {
      resolve(texture);
    });
  });
  scene.traverse((child: any) => {
    if (child.isMesh && loadedTexture != null) {
      // Set texture filtering and wrap mode to improve sharpness
      loadedTexture.magFilter = THREE.NearestFilter;
      loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTexture.wrapS = THREE.RepeatWrapping;
      loadedTexture.wrapT = THREE.RepeatWrapping;
      loadedTexture.repeat.set(1, 1);
      child.material.map = loadedTexture;
    }
  });

  const canvas = node;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  renderer.setPixelRatio(window.devicePixelRatio);
  const canvasSizeMultiplier = 2; // Adjust this value as needed
  renderer.setSize(width * cameraOptions.fov * canvasSizeMultiplier, height * cameraOptions.fov * canvasSizeMultiplier);
  tempNode.appendChild(renderer.domElement);
  renderer.render(scene, camera);
  node.src = renderer.domElement.toDataURL();
};
export const PrepareSceneForRender = async function (model: string) {
  let scene = new THREE.Scene();
  let modelLoader = new GLTFLoader();
  scene.position.y = -1;

  let camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const brightness = 1.2;
  // Add a directional light
  const light = new THREE.AmbientLight(0xffffff, brightness * 1.8, 10);
  scene.add(light);
  const pointLight = new THREE.DirectionalLight(
    0xffffff,
    brightness * 0.65,
    10
  );
  pointLight.position.set(0, 50, -50);
  scene.add(pointLight);

  const gltfScene = await new Promise((resolve) => {
    modelLoader.load(model, (gltf) => {
      scene.add(gltf.scene);

      resolve(gltf.scene);
    });
  });
  return { scene, camera, renderScene: gltfScene, modelLoader: modelLoader };
};
