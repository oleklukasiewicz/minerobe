import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderAnimation } from "./animation";
import { defaultRenderer, snapshotTemporaryNode } from "./cache";
import { get } from "svelte/store";
import { GetCameraConfigForType } from "$src/helpers/render/renderHelper";
import { ALEX_MODEL, MODEL_TYPE, STEVE_MODEL } from "./consts/model";
import { DEFAULT_RENDERER } from "./static";
export class CameraConfig {
  rotation: THREE.Vector3;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  lookAtEnabled: boolean;
  fov: number;
  constructor(
    fov = 75,
    position: THREE.Vector3 = new THREE.Vector3(0, 0.05, 1),
    lookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    lookAtEnabled: boolean = true,
    rotation: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ) {
    this.fov = fov;
    this.position = position;
    this.lookAt = lookAt;
    this.lookAtEnabled = lookAtEnabled;
    this.rotation = rotation;
  }
}

export class RenderSnapshot {
  cameraOptions: CameraConfig = new CameraConfig();
  texture: any;
  provider: RenderProvider;
  node: any;
  tempNode: any;
}
export class RenderLightConfig {
  enableShadows: boolean = true;
  enableModelShadows: boolean = true;
  shadow: {
    type: any;
    enabled: boolean;
    bias: number;
    radius: number;
    mapSize: number;
  } = {
    type: THREE.PCFShadowMap,
    enabled: true,
    bias: -0.00001,
    radius: 1,
    mapSize: 1024,
  };
  ambient: {
    isEnabled: boolean;
    color: THREE.Color;
    intensity: number;
    distance: number;
  } = {
    isEnabled: true,
    color: new THREE.Color(0xffffff),
    intensity: 2.16,
    distance: 10,
  };
  directional: {
    isEnabled: boolean;
    color: THREE.Color;
    intensity: number;
    position: THREE.Vector3;
    target: THREE.Vector3;
    cameraSize: number;
  } = {
    isEnabled: true,
    color: new THREE.Color(0xffffff),
    intensity: 0.78,
    position: new THREE.Vector3(0, 10, -10),
    target: new THREE.Vector3(0, 2, 0),
    cameraSize: 0.8,
  };
}
export class RenderProvider {
  renderer: any;
  scene: any;
  camera: any;
  textureLoader: any;
  name: string = "";
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
export const PrepareSceneForRender = async function (
  model: string,
  disableDefaultModelRotation = false
) {
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
  if (disableDefaultModelRotation) {
    const renderScene: any = gltfScene;
    renderScene.getObjectByName("RightArm").rotation.set(0, 0, 0);
    renderScene.getObjectByName("LeftArm").rotation.set(0, 0, 0);
    renderScene.getObjectByName("RightLeg").rotation.set(0, 0, 0);
    renderScene.getObjectByName("LeftLeg").rotation.set(0, 0, 0);
    renderScene.getObjectByName("Head").rotation.set(0, 0, 0);
  }

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
  if (lightConfig.enableShadows) {
    _renderer.shadowMap.enabled = true;
    _renderer.shadowMap.type = lightConfig.shadow.type;
  }
  // Add a directional light
  if (lightConfig.ambient.isEnabled) {
    const light = new THREE.AmbientLight(
      lightConfig.ambient.color,
      lightConfig.ambient.intensity,
      lightConfig.ambient.distance
    );
    _provider.scene.add(light);
  }
  if (lightConfig.directional.isEnabled) {
    const pointLight = new THREE.DirectionalLight(
      lightConfig.directional.color,
      lightConfig.directional.intensity
    );
    pointLight.castShadow = lightConfig.enableShadows;
    if (lightConfig.shadow.enabled) {
      pointLight.shadow.camera.left = -lightConfig.directional.cameraSize;
      pointLight.shadow.camera.right = lightConfig.directional.cameraSize;
      pointLight.shadow.camera.top = lightConfig.directional.cameraSize;
      pointLight.shadow.camera.bottom = -lightConfig.directional.cameraSize;
      pointLight.shadow.bias = lightConfig.shadow.bias;
      pointLight.shadow.radius = lightConfig.shadow.radius;
      pointLight.shadow.mapSize.width = lightConfig.shadow.mapSize;
      pointLight.shadow.mapSize.height = lightConfig.shadow.mapSize;
    }
    pointLight.target.position.set(
      lightConfig.directional.target.x,
      lightConfig.directional.target.y,
      lightConfig.directional.target.z
    );
    pointLight.position.set(
      lightConfig.directional.position.x,
      lightConfig.directional.position.y,
      lightConfig.directional.position.z
    );
    pointLight.shadowCameraVisible = true;
    _provider.scene.add(pointLight);
  }

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
          if (lightConfig.enableShadows) child.castShadow = true;
          if (lightConfig.enableModelShadows) child.receiveShadow = true;
          //child.receiveShadow = true;
          // Set texture filtering and wrap mode to improve sharpness
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;

          const mat = child.material as THREE.MeshStandardMaterial;
          mat.map = texture;
          mat.roughness = 1;
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
export const CreateDefaultRenderProvider = async function (
  renderer,
  disableDefaultModelRotation = false
) {
  let steveListProvider = new RenderProvider();
  let alexListProvider = new RenderProvider();
  steveListProvider.renderer = renderer;
  steveListProvider.textureLoader = new THREE.TextureLoader();
  let steveScene = await PrepareSceneForRender(
    STEVE_MODEL.model,
    disableDefaultModelRotation
  );
  steveListProvider.scene = steveScene.scene;

  steveListProvider.camera = steveScene.camera;
  steveListProvider.name = "steve";

  alexListProvider.renderer = renderer;
  alexListProvider.textureLoader = new THREE.TextureLoader();
  let alexScene = await PrepareSceneForRender(
    ALEX_MODEL.model,
    disableDefaultModelRotation
  );
  alexListProvider.scene = alexScene.scene;
  alexListProvider.camera = alexScene.camera;
  alexListProvider.name = "alex";
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
  return await RenderFromSnapshot(snapshot, 150, 150);
};

export class OutfitPackageRender {
  private renderer: any;
  private model: any;
  private texture: string;
  private node: any;
  private cameraOptions: any;
  private modelScene: ModelScene;
  private textureLoader: any;
  private loadedTexture: any;
  private animations: RenderAnimation[] = [];
  private animationQueueLimit: number = 2;
  private renderingActive: boolean = false;
  private shadowsEnabled: boolean = false;

  //for dynamic render
  private clock = null;
  private orbitalControls: any = null;
  private animationData: any = null;
  private animationPrepared: boolean = false;
  private animationIsQuiting: boolean = false;

  private _loadTexture = async function () {
    return new Promise((resolve) => {
      this.textureLoader.load(this.texture, (texture) => {
        resolve(texture);
      });
    });
  };
  private _applyTextureToModel = async function () {
    this.modelScene.renderScene.traverse((child: any) => {
      if (child.isMesh && this.loadedTexture != null) {
        if (this.shadowsEnabled) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        this.loadedTexture.magFilter = THREE.NearestFilter;
        this.loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        this.loadedTexture.wrapS = THREE.RepeatWrapping;
        this.loadedTexture.wrapT = THREE.RepeatWrapping;

        const mat = child.material as THREE.MeshStandardMaterial;
        mat.map = this.loadedTexture;
        mat.roughness = 1;
      }
    });
  };
  private _loadCameraOptions = function () {
    const options = this.cameraOptions || new CameraConfig();
    this.modelScene.camera.position.x = options.position.x;
    this.modelScene.camera.position.y = options.position.y;
    this.modelScene.camera.position.z = options.position.z;
    this.modelScene.camera.rotation.x = options.rotation.x;
    this.modelScene.camera.rotation.y = options.rotation.y;
    this.modelScene.camera.rotation.z = options.rotation.z;
    this.modelScene.camera.lookAt(options.lookAt);
    this.modelScene.camera.fov = options.fov;
  };
  private _render = function (_self = this) {
    if (!_self.renderingActive) return;
    //frame rendering
    const _clockActualDelta = this.clock.getDelta();
    const _clockDelta = _clockActualDelta > 1 ? 1 : _clockActualDelta;
    const _clockElapsedTime = this.clock.getElapsedTime();

    //animations
    //console.log(this.animations);
    const currentAnimation: RenderAnimation = this.animations[0];
    if (currentAnimation != null) {
      if (!_self.animationPrepared)
        _self._prepareAnimation(currentAnimation, false);
      if (_self.animations.length > 1) _self.animationIsQuiting = true;
      if (_self.animationIsQuiting) {
        const isCurrentAnimationFinishedQueting = currentAnimation.stop(
          _self.animationData,
          _self.modelScene.renderScene,
          _clockDelta,
          _self.modelScene.model,
          _clockElapsedTime
        );
        if (isCurrentAnimationFinishedQueting) {
          _self.animationIsQuiting = false;
          _self.animationPrepared = false;
          _self.animationData = null;
          _self.animations.shift();
        }
      } else
        currentAnimation.render(
          _self.animationData,
          _self.modelScene.renderScene,
          _clockDelta,
          _self.modelScene.model,
          _clockElapsedTime
        );
    }

    this.renderer.render(this.modelScene.scene, this.modelScene.camera);
    this.node.appendChild(this.renderer.domElement);
    requestAnimationFrame(() => this._render(this));
  };
  private _prepareAnimation(animation: RenderAnimation, keepData: boolean) {
    if (this.animationPrepared) return;
    const animationData = animation.prepare(
      this.modelScene.renderScene,
      keepData
    );
    this.animationData = Object.assign(this.animationData || {}, animationData);
    this.animationPrepared = true;
  }
  private _updateRenderSize = function () {
    const canvas = this.node;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const fov = 1;

    this.modelScene.camera.aspect = width / height;
    this.modelScene.camera.updateProjectionMatrix();
    this.renderer.setSize(width * fov, height * fov);
  };
  private _loadCanvasSize = function () {
    const canvas = this.node;
    const width = canvas.clientWidth != 0 ? canvas.clientWidth : 300;
    const height = canvas.clientHeight != 0 ? canvas.clientHeight : 300;
    const canvasSizeMultiplier = 1;
    const fov = 1;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      width * fov * canvasSizeMultiplier,
      height * fov * canvasSizeMultiplier
    );
  };

  constructor(renderer: any = DEFAULT_RENDERER) {
    this.renderer = renderer;
    this.textureLoader = new THREE.TextureLoader();
  }
  SetModelScene = function (modelScene: ModelScene): OutfitPackageRender {
    this.modelScene = modelScene;
    return this;
  };
  SetTexture = async function (texture: string): Promise<OutfitPackageRender> {
    this.texture = texture;
    this.loadedTexture = await this._loadTexture();
    return this;
  };
  SetRenderer = function (renderer: any): OutfitPackageRender {
    this.renderer = renderer;
    return this;
  };
  SetNode = function (node: any): OutfitPackageRender {
    this.node = node;
    return this;
  };
  SetCameraOptions = function (cameraOptions: any): OutfitPackageRender {
    this.cameraOptions = cameraOptions;
    return this;
  };
  RenderStatic = function (): OutfitPackageRender {
    this._loadCanvasSize();
    this._loadCameraOptions();
    this._applyTextureToModel();

    this.node.appendChild(this.renderer.domElement);
    this.renderer.render(this.modelScene.scene, this.modelScene.camera);
    const dataUrl = this.renderer.domElement.toDataURL();
    this.node.children[0].remove();
    this.node.src = dataUrl;
    return this;
  };
  AddAnimation = function (animation: RenderAnimation): OutfitPackageRender {
    if (this.animations.length >= this.animationQueueLimit) return this;
    this.animations.push(animation);
    return this;
  };
  SetAnimationsLimit = function (limit: number): OutfitPackageRender {
    this.animationQueueLimit = limit;
    return this;
  };
  RenderDynamic = function (): OutfitPackageRender {
    this.StopRendering();
    //initial configuration
    this.renderingActive = true;

    this.clock = new THREE.Clock();
    this.orbitalControls = new OrbitControls(
      this.modelScene.camera,
      this.renderer.domElement
    );
    this.orbitalControls.enablePan = false;
    this.orbitalControls.maxDistance = 3.0;
    this.orbitalControls.minDistance = -3.5;

    this._loadCameraOptions();
    this._applyTextureToModel();

    this._updateRenderSize();
    this._render();
    return this;
  };
  StopRendering = function (): OutfitPackageRender {
    this.renderingActive = false;
    this.clock = null;
    return this;
  };
  AddShadow = function (): OutfitPackageRender {
    this.shadowsEnabled = true;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const pointLight = new THREE.DirectionalLight(0xffffff, 0.78);

    pointLight.castShadow = true;
    pointLight.shadow.camera.left = -0.8;
    pointLight.shadow.camera.right = 0.8;
    pointLight.shadow.camera.top = 0.8;
    pointLight.shadow.camera.bottom = -0.8;
    pointLight.shadow.bias = -0.0001;
    pointLight.shadow.radius = 1;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;

    pointLight.target.position.set(0, 1, 0);
    pointLight.position.set(0, 10, -10);
    pointLight.shadowCameraVisible = true;
    this.modelScene.scene.add(pointLight);

    return this;
  };
  AddFloor = function (texture: string): OutfitPackageRender {
    const floorTexture = new THREE.TextureLoader().load(texture);
    const floorGeometry = new THREE.PlaneGeometry(3, 3, 3, 3);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      side: THREE.DoubleSide,
      roughness: 1,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.modelScene.scene.add(floor);
    return this;
  };
  SetBackground = function (color: THREE.Color): OutfitPackageRender {
    this.renderer.setClearColor(color, 1);
    return this;
  }
}
export class ModelScene {
  model: string;
  camera: any;
  scene: any;
  renderScene: any;
  constructor(model: string) {
    this.model = model;
  }
  async Create() {
    //prepare scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const modelLoader = new GLTFLoader();

    //set default values
    this.scene.position.y = -1;
    const brightness = 1.2;
    const light = new THREE.AmbientLight(0xffffff, brightness * 1.8, 10);

    //configure light
    this.scene.add(light);
    const pointLight = new THREE.DirectionalLight(
      0xffffff,
      brightness * 0.65,
      10
    );
    pointLight.position.set(0, 50, -50);
    this.scene.add(pointLight);

    //load model
    this.renderScene = await new Promise((resolve) => {
      modelLoader.load(this.model, (gltf) => {
        this.scene.add(gltf.scene);
        resolve(gltf.scene);
      });
    });
    return this;
  }
}
