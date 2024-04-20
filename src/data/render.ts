import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { RenderAnimation } from "./animation";
import { defaultRenderer, snapshotTemporaryNode } from "./cache";
import { get } from "svelte/store";
import { MODEL_TYPE, STEVE_MODEL, ALEX_MODEL } from "./consts";
import { GetCameraConfigForType } from "$src/helpers/render/renderHelper";
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
export class RenderLightConfig {
  color: THREE.Color = new THREE.Color(0xffffff);
  intensity: number = 1;
  distance: number = 0;
  decay: number = 1;
  shadow: boolean = true;
  shadowBias: number = 0;
  shadowRadius: number = 1;
  shadowMapSize: number = 1024;
  shadowCameraVisible: boolean = false;
  shadowCameraNear: number = 0.5;
  shadowCameraFar: number = 500;
}
export class RenderProvider {
  renderer: any;
  scene: any;
  camera: any;
  textureLoader: any;
}
export class DynamicRenderOptions {
  backgroundColor: THREE.Color = new THREE.Color(0x000000);
  backgroundColorOpacity: number = 1;
  floor: boolean = true;
  floorTexture: string = "";
  orbitControls: boolean = false;
}
export const RenderFromSnapshot = async function (
  snapshot: RenderSnapshot,
  renderWidth: number = 300,
  renderHeight: number = 300
) {
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

  const canvas = node || tempNode;
  const width = canvas.clientWidth != 0 ? canvas.clientWidth : renderWidth;
  const height = canvas.clientHeight != 0 ? canvas.clientHeight : renderHeight;
  if (width == 0 || height == 0) return false;
  renderer.setPixelRatio(window.devicePixelRatio);
  const canvasSizeMultiplier = 2; // Adjust this value as needed
  renderer.setSize(
    width * cameraOptions.fov * canvasSizeMultiplier,
    height * cameraOptions.fov * canvasSizeMultiplier
  );
  tempNode.appendChild(renderer.domElement);
  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL();
  if (node) node.src = dataUrl;
  return dataUrl;
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
export const CreateDynamicRender = async function (
  node: HTMLElement,
  provider: RenderProvider,
  cameraOptions: CameraConfig = new CameraConfig(),
  renderOptions: DynamicRenderOptions = new DynamicRenderOptions(),
  lightConfig: RenderLightConfig = new RenderLightConfig()
) {
  let _provider = provider;
  let _renderer = _provider.renderer;
  let _animations: RenderAnimation[] = [];
  let _currentAnimation: RenderAnimation | null = null;
  let _animationQueueLimit = -1;
  let _renderNode: HTMLElement | null = node;
  let _loadedModelScene = null;
  let _loadedModelName = null;
  let _renderingStoped = false;
  let _currentTexture = null;

  //three
  let _clock = new THREE.Clock();
  let _modelLoader = new GLTFLoader();
  let _orbitalControls: any = null;

  //animation
  let _currentAnimationData: any = null;
  let _currentAnimationPrepared: boolean = false;
  let _currentAnimationIsQuiting: boolean = false;

  ///rendering
  const _renderAnimation = async function () {
    const delt = _clock.getDelta();
    const clockDelta = delt > 1 ? 1 : delt;
    const clockElapsedTime = _clock.getElapsedTime();
    if (
      _animations.length > 0 &&
      _currentAnimation != null &&
      _currentAnimationPrepared
    )
      _currentAnimationIsQuiting = true;
    if (_currentAnimation) {
      if (!_currentAnimationPrepared) {
        await _prepareAnimation(_currentAnimation, false);
      } else {
        if (_currentAnimationData != null) {
          if (_currentAnimationIsQuiting) {
            const isCurrentAnimationFinishedQueting = _currentAnimation.stop(
              _currentAnimationData,
              _loadedModelScene,
              clockDelta,
              _loadedModelName,
              clockElapsedTime
            );
            if (isCurrentAnimationFinishedQueting) {
              _currentAnimationIsQuiting = false;
              _currentAnimationPrepared = false;
              _currentAnimationData = null;
              _currentAnimation = _animations[0];
              _animations.shift();
            }
          } else {
            _currentAnimation.render(
              _currentAnimationData,
              _loadedModelScene,
              clockDelta,
              _loadedModelName,
              clockElapsedTime
            );
          }
        }
      }
    } else {
      if (_animations.length > 0) {
        _currentAnimation = _animations[0];
        _currentAnimationIsQuiting = false;
        _currentAnimationPrepared = false;
        _currentAnimationData = null;
        _animations.shift();
      }
    }
  };
  const _render = async function () {
    if (_renderNode == null || _loadedModelScene == null) return;
    const canvas = _renderNode;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    _renderAnimation();

    //request new frame
    if (!_renderingStoped) requestAnimationFrame(_render);
    if (_orbitalControls != null) _orbitalControls.update();
    _renderer.setSize(width, height);
    //animations

    _renderer.render(_provider.scene, _provider.camera);
    _renderNode.appendChild(_renderer.domElement);
  };
  const _updateRenderSize = function () {
    if (_renderNode == null) return;
    const canvas = _renderNode;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    _provider.camera.aspect = width / height;
    _provider.camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", _updateRenderSize);

  const _prepareAnimation = async function (
    animation: RenderAnimation,
    keepData: boolean
  ) {
    if (_loadedModelScene == null) return;
    if (_loadedModelName == null) return;
    if (!_currentAnimationPrepared) {
      const animationData = animation.prepare(
        _loadedModelScene,
        false,
        _loadedModelName
      );
      _currentAnimationData = animationData;
    }
    if (keepData && _currentAnimationPrepared) {
      const animationData = animation.prepare(
        _loadedModelScene,
        true,
        _loadedModelName
      );
      if (_currentAnimationData != null) {
        Object.assign(_currentAnimationData, animationData);
      }
    }
    _currentAnimationPrepared = true;
  };

  provider.camera.position.x = cameraOptions.position.x;
  provider.camera.position.y = cameraOptions.position.y;
  provider.camera.position.z = cameraOptions.position.z;

  provider.camera.rotation.x = cameraOptions.rotation.x;
  provider.camera.rotation.y = cameraOptions.rotation.y;
  provider.camera.rotation.z = cameraOptions.rotation.z;

  if (cameraOptions.lookAtEnabled) provider.camera.lookAt(cameraOptions.lookAt);
  provider.camera.fov = cameraOptions.fov;

  _renderer.setPixelRatio(window.devicePixelRatio);
  _renderer.setClearColor(
    renderOptions.backgroundColor,
    renderOptions.backgroundColorOpacity
  );

  //light
  const brightness = 1.2;
  // Add a directional light
  const light = new THREE.AmbientLight(0xffffff, brightness * 1.8, 10);
  _provider.scene.add(light);
  const pointLight = new THREE.DirectionalLight(
    0xffffff,
    brightness * 0.65,
    10
  );

  pointLight.target.position.set(0, 2, 0);
  pointLight.position.set(0, 50, -50);
  pointLight.shadowCameraVisible = true;

  console.log(lightConfig);
  if (lightConfig.shadow) {
    pointLight.castShadow = true;
    pointLight.shadow.bias = lightConfig.shadowBias;
    pointLight.shadow.radius = lightConfig.shadowRadius;
    pointLight.shadow.mapSize.width = lightConfig.shadowMapSize;
    pointLight.shadow.mapSize.height = lightConfig.shadowMapSize;
    pointLight.shadow.camera.near = lightConfig.shadowCameraNear;
    pointLight.shadow.camera.far = lightConfig.shadowCameraFar;
  }

  _provider.scene.add(pointLight);
  if (renderOptions.orbitControls) {
    _orbitalControls = new OrbitControls(
      _provider.camera,
      _provider.renderer.domElement
    );
    _orbitalControls.enablePan = false;
    _orbitalControls.maxDistance = 3.0;
    _orbitalControls.minDistance = 0.5;
  }
  if (renderOptions.floor) {
    const floorTexture = await provider.textureLoader.loadAsync(
      renderOptions.floorTexture
    );
    const floorGeometry = new THREE.PlaneGeometry(3, 3, 3, 3);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      side: THREE.DoubleSide,
      roughness: 1, // Lower values result in sharper, darker shadows
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    _provider.scene.add(floor);
  }
  _updateRenderSize();

  const _setModel = async function (model: string, modelName: string) {
    if (model == null) return;
    return new Promise((resolve) => {
      _modelLoader.load(model, (gltf) => {
        if (_loadedModelScene != null) {
          _provider.scene.remove(_loadedModelScene);
        }
        _provider.scene.add(gltf.scene);
        _loadedModelScene = gltf.scene;
        _loadedModelName = modelName;
        _updateAnimation();
        resolve(gltf.scene);
      });
    });
  };

  const _setTexture = async function (texture: string) {
    if (!texture) return;
    return new Promise((resolve) => {
      _provider.textureLoader.load(texture, (texture) => {
        resolve(texture);
      });
    });
  };
  const _applyTextureToModel = async function (loadedTexture: Promise<any>) {
    if (_loadedModelScene == null) return;

    await Promise.all([loadedTexture]).then(([values]) => {
      let texture: any = values;
      _loadedModelScene.traverse((child: any) => {
        if (child.isMesh && texture != null) {
          if (lightConfig.shadow) child.castShadow = true;
          //child.receiveShadow = true;
          // Set texture filtering and wrap mode to improve sharpness
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;

          const mat = child.material as THREE.MeshStandardMaterial;
          mat.map = texture;
          //mat.roughness = 1;
        }
      });
    });
  };
  const _addAnimation = async function (animation: RenderAnimation) {
    if (_animationQueueLimit > 0 && _animations.length >= _animationQueueLimit)
      return;
    _animations.push(animation);
  };
  const _updateAnimation = function () {
    if (_currentAnimation == null) return;
    _prepareAnimation(_currentAnimation, true);
  };
  const setModel = async function (model: string, modelName: string) {
    const modelPromise = _setModel(model, modelName);
    await Promise.all([modelPromise]).then(() => {
      _applyTextureToModel(_setTexture(_currentTexture));
    });
  };
  const setTexture = async function (texture: string) {
    _currentTexture = texture;
    _applyTextureToModel(_setTexture(texture));
  };
  return {
    setModel,
    setTexture,
    addAnimation: _addAnimation,
    setAnimationQueueLimit: (limit: number) => {
      _animationQueueLimit = limit;
    },
    getAnimationQueue: () => {
      return _animations;
    },
    stopRendering: () => {
      _renderingStoped = true;
    },
    startRendering: () => {
      _renderingStoped = false;
      _render();
    },
    setRenderNode: (node: HTMLElement) => {
      _renderNode = node;
    },
  };
};
export const CreateDefaultRenderProvider = async function (renderer) {
  let steveListProvider = new RenderProvider();
  let alexListProvider = new RenderProvider();
  steveListProvider.renderer = renderer;
  steveListProvider.textureLoader = new THREE.TextureLoader();
  let steveScene = await PrepareSceneForRender(STEVE_MODEL.model);
  steveListProvider.scene = steveScene.scene;
  steveListProvider.camera = steveScene.camera;

  alexListProvider.renderer = renderer;
  alexListProvider.textureLoader = new THREE.TextureLoader();
  let alexScene = await PrepareSceneForRender(ALEX_MODEL.model);
  alexListProvider.scene = alexScene.scene;
  alexListProvider.camera = alexScene.camera;
  return { steve: steveListProvider, alex: alexListProvider };
};
export const RenderTextureInTemporyNode = async function (
  texture: string,
  model: string,
  outfitType: string
) {
  const defSnapshots = await CreateDefaultRenderProvider(get(defaultRenderer));
  let snapshot = new RenderSnapshot();

  snapshot.provider =
    model == MODEL_TYPE.STEVE ? defSnapshots.steve : defSnapshots.alex;
  snapshot.texture = texture;
  snapshot.cameraOptions = GetCameraConfigForType(outfitType);
  snapshot.provider.camera = new THREE.OrthographicCamera();
  snapshot.tempNode = get(snapshotTemporaryNode);
  snapshot.node = get(snapshotTemporaryNode);
  return await RenderFromSnapshot(snapshot, 300, 300);
};
