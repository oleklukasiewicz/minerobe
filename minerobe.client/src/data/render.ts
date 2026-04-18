import { RenderAnimation } from "./animation";
import { ALEX_MODEL, STEVE_MODEL } from "./consts/model";
import { DEFAULT_RENDERER } from "./static";
import type { OutfitLayer, OutfitPackage } from "$data/models/package";
import type { OutfitPackageRenderConfig } from "$data/models/render";
import { MODEL_TYPE } from "./enums/model";
export class CameraConfig {
  rotation: any;
  position: any;
  lookAt: any;
  lookAtEnabled: boolean;
  fov: number;
  zoom: number;
  constructor(
    position: Vector3Min = new Vector3Min(0, 0, -1),
    lookAt: Vector3Min = new Vector3Min(0, 0, 0),
    zoom: number = 0.95,
    fov: number = 1,
    lookAtEnabled: boolean = false,
    rotation: Vector3Min = new Vector3Min(0, 0, 0)
  ) {
    this.fov = fov;
    this.position = position;
    this.lookAt = lookAt;
    this.lookAtEnabled = lookAtEnabled;
    this.rotation = rotation;
    this.zoom = zoom;
  }
}
import capeModelData from "$src/playerModel/cape.gltf?raw";
import { THREE, Vector3Min } from "$lib/three";
export class TextureRender {
  private renderer: any;
  private model: any;
  private texture: string;
  private node: any;
  private cameraOptions: any;
  private modelScene: ModelScene;
  private textureLoader: any;
  private loadedTexture: any;
  private renderingActive: boolean = false;
  private shadowsEnabled: boolean = false;
  private shadowScene: any = null;
  private floorScene: boolean = null;
  private temporaryRenderNode: any = null;
  private capeTexture: string = null;
  private capeScene: any = null;
  private capePivot: any = null;
  private renderingPaused: boolean = false;
  private ambientLight: any = null;
  private directionalLight: any = null;
  //for dynamic render
  private animationEngine: RenderAnimationEngine = null;
  private orbitalControls: any = null;
  private lastRenderWidth: number = -1;
  private lastRenderHeight: number = -1;
  private lastPixelRatio: number = -1;
  private lastCameraOptionsKey: string = "";
  private _toVector3 = async function (value) {
    const threeModule = await THREE.getThree();
    return new threeModule.Vector3(value.x, value.y, value.z);
  };
  private _ensureRendererAttached = function (targetNode: any) {
    if (this.renderer?.domElement?.parentNode !== targetNode) {
      targetNode.appendChild(this.renderer.domElement);
    }
  };
  private _ensureAnimationEngine = async function () {
    if (this.animationEngine != null) return this.animationEngine;
    this.animationEngine = new RenderAnimationEngine();
    await this.animationEngine.Create();
    return this.animationEngine;
  };
  private _renderAnimationFrame = async function () {
    const animationEngine = await this._ensureAnimationEngine();
    await animationEngine.PrepareAnimation(
      this.modelScene.renderScene,
      this.modelScene.name
    );
    await animationEngine.RenderAnimationFrame();
  };
  private _removeSceneObject = function (obj: any) {
    if (obj != null) this.modelScene.scene.remove(obj);
  };
  private _refreshAnimationDataIfRendering = async function () {
    if (!this.renderingActive || this.animationEngine == null) return;
    await this.animationEngine.RefreshAnimationData(
      this.modelScene.renderScene,
      this.modelScene.name
    );
  };

  private _loadTexture = async function (targetTexture: string = null, flipY) {
    return new Promise(async (resolve) => {
      const threeModule = await THREE.getThree();
      if (this.textureLoader == null) {
        this.textureLoader = new threeModule.ImageBitmapLoader();
        this.textureLoader.setOptions({ imageOrientation: "flipY" });
      }
      this.textureLoader.load(
        targetTexture,
        (texture) => {
          const canvasTexture = new threeModule.CanvasTexture(texture);
          resolve(canvasTexture);
        },
        undefined,
        (error) => {
          // On error, resolve with null to prevent hanging promise
          console.warn("Texture load failed:", error);
          resolve(null);
        }
      );
    });
  };
  private _attachCapeToModel = async function () {
    const bodyPart = this.modelScene.renderScene.getObjectByName("Body");
    if (this.capePivot != null) {
      bodyPart.remove(this.capePivot);
      this.capePivot = null;
    }
    const threeModule = await THREE.getThree();
    const pivot = new threeModule.Object3D();
    pivot.position.set(0, -0.02, 0);
    this.capePivot = pivot;
    pivot.add(this.capeScene);
    bodyPart.add(pivot);
  };
  private _loadModelToTempScene = async function (model: string) {
    return new Promise(async (resolve) => {
      const module = await THREE.getGLTFLoader();
      const modelLoader = new module.GLTFLoader();
      modelLoader.load(model, (gltf) => {
        resolve(gltf.scene);
      });
    });
  };
  private _applyTextureToModel = async function () {
    if (this.loadedTexture == null) return;
    const threeModule = await THREE.getThree();
    this.loadedTexture.magFilter = threeModule.NearestFilter;
    this.loadedTexture.minFilter = threeModule.LinearMipmapLinearFilter;
    this.loadedTexture.wrapS = threeModule.RepeatWrapping;
    this.loadedTexture.wrapT = threeModule.RepeatWrapping;

    this.modelScene.renderScene.traverse((child: any) => {
      if (child.isMesh && child.name != "Cape") {
        if (this.shadowsEnabled) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        const mat = child.material;
        mat.map = this.loadedTexture;
        mat.roughness = 1;
      }
    });
  };
  private _loadCameraOptions = async function () {
    if (this.modelScene == null) return;
    let options = new CameraConfig();
    const threeModule = await THREE.getThree();
    if (!this.renderingActive) {
      options = this.cameraOptions || new CameraConfig();
    } else {
      options = new CameraConfig(
        new threeModule.Vector3(0, 0, -2),
        undefined,
        undefined,
        75
      );
    }

    options.position = await this._toVector3(options.position);
    options.lookAt = await this._toVector3(options.lookAt);
    options.rotation = await this._toVector3(options.rotation);

    const cameraOptionsKey = [
      options.position.x,
      options.position.y,
      options.position.z,
      options.rotation.x,
      options.rotation.y,
      options.rotation.z,
      options.lookAt.x,
      options.lookAt.y,
      options.lookAt.z,
      options.fov,
      options.zoom,
    ].join("|");

    if (cameraOptionsKey === this.lastCameraOptionsKey) return;

    this.modelScene.camera.position.copy(options.position);
    this.modelScene.camera.rotation.set(
      options.rotation.x,
      options.rotation.y,
      options.rotation.z
    );
    this.modelScene.camera.lookAt(options.lookAt);
    this.modelScene.camera.fov = options.fov;
    this.modelScene.camera.zoom = options.zoom;
    this.lastCameraOptionsKey = cameraOptionsKey;
  };
  private _render = async function (_self = this) {
    if (!_self.renderingActive) return;

    if (!this.renderingPaused) {
      await this._renderAnimationFrame();

      this._ensureRendererAttached(this.node);
      this.renderer.render(this.modelScene.scene, this.modelScene.camera);
    }

    requestAnimationFrame(async () => await this._render(this));
  };
  private _updateRenderSize = function () {
    if (this.modelScene?.camera == null) return;
    const canvas = this.node;
    const width = canvas.clientWidth != 0 ? canvas.clientWidth : 300;
    const height = canvas.clientHeight != 0 ? canvas.clientHeight : 300;
    const canvasSizeMultiplier = 1;
    const fov = 1;
    if (this.renderer == null) return;

    const nextWidth = width * fov * canvasSizeMultiplier;
    const nextHeight = height * fov * canvasSizeMultiplier;
    const nextPixelRatio = window.devicePixelRatio;
    const sizeChanged =
      this.lastRenderWidth !== nextWidth || this.lastRenderHeight !== nextHeight;
    const pixelRatioChanged = this.lastPixelRatio !== nextPixelRatio;

    if (!sizeChanged && !pixelRatioChanged) return;

    if (pixelRatioChanged) {
      this.renderer.setPixelRatio(nextPixelRatio);
      this.lastPixelRatio = nextPixelRatio;
    }

    if (sizeChanged) {
      this.renderer.setSize(nextWidth, nextHeight);
      this.lastRenderWidth = nextWidth;
      this.lastRenderHeight = nextHeight;
    }

    this.modelScene.camera.aspect = width / height;
    this.modelScene.camera.updateProjectionMatrix();
  };
  private _renderInNode = function () {
    if (this.loadedTexture == null) return;
    const renderNode = this.temporaryRenderNode || this.node;
    renderNode.appendChild(this.renderer.domElement);

    this.renderer.render(this.modelScene.scene, this.modelScene.camera);

    const dataUrl = this.renderer.domElement.toDataURL();
    this.node.src = dataUrl;

    renderNode.removeChild(this.renderer.domElement);
  };

  constructor(renderer: any = DEFAULT_RENDERER) {
    this.renderer = renderer;
  }
  SetModelScene = async function (
    newModelScene: ModelScene
  ): Promise<TextureRender> {
    const targetSceneModel = newModelScene;
    const newRenderScene = targetSceneModel.scene.children.find(
      (x) => x.name == "model"
    );
    if (this.modelScene == null) {
      this.modelScene = targetSceneModel;
      this.modelScene.scene = targetSceneModel.scene;
      this.modelScene.renderScene = newRenderScene;
    } else {
      this.modelScene.scene.remove(this.modelScene.renderScene);
      this.modelScene.scene.add(newRenderScene);
      this.modelScene.renderScene = newRenderScene;
    }
    this.modelScene.name = targetSceneModel.name;
    this.lastCameraOptionsKey = "";
    if (this.renderingActive) await this._applyTextureToModel();
    if (this.capeTexture != null) {
      await this._attachCapeToModel();
    }
    await this._refreshAnimationDataIfRendering();
    return this;
  };
  PauseRendering = function (): TextureRender {
    this.renderingPaused = true;
    return this;
  };
  ResumeRendering = function (): TextureRender {
    this.renderingPaused = false;
    return this;
  };
  SetTextureAsync = async function (texture: string): Promise<TextureRender> {
    this.texture = texture;
    if (texture != null) {
      this.loadedTexture = await this._loadTexture(texture);
    }
    if (this.renderingActive) {
      await this._applyTextureToModel();
    }
    if (this.renderingActive === false) {
      // For static rendering, refresh the frame
      await this.RenderStatic();
    }
    return this;
  };
  GetTexture = function (): string {
    return this.texture;
  };
  SetRenderer = function (renderer: any): TextureRender {
    this.renderer = renderer;
    return this;
  };
  SetNode = function (node: any): TextureRender {
    this.node = node;
    return this;
  };
  SetTemporaryRenderNode = function (node: any): TextureRender {
    this.temporaryRenderNode = node;
    return this;
  };
  RemoveTemporaryRenderNode = function (): TextureRender {
    this.temporaryRenderNode = null;
    return this;
  };
  SetCameraOptions = async function (
    cameraOptions: CameraConfig | string
  ): Promise<TextureRender> {
    if (typeof cameraOptions != "string") {
      cameraOptions.position = await this._toVector3(cameraOptions.position);
      cameraOptions.lookAt = await this._toVector3(cameraOptions.lookAt);
    }
    this.cameraOptions = cameraOptions;
    return this;
  };
  AddAnimation = function (
    animation: RenderAnimation,
    force: boolean
  ): TextureRender {
    if (this.animationEngine == null) {
      this.animationEngine = new RenderAnimationEngine();
      this.animationEngine.Create();
    }
    this.animationEngine.AddAnimation(animation, force);
    return this;
  };
  SetAnimationsLimit = function (limit: number): TextureRender {
    //this.animationEngine.animationQueueLimit = limit;
    return this;
  };
  RenderStatic = async function (): Promise<TextureRender> {
    //do it in one paint call
    requestAnimationFrame(async () => {
      if (this.renderer == null) return this;

      await this._loadCameraOptions();
      this._updateRenderSize();
      await this._applyTextureToModel();

      this._renderInNode();
    });
    return this;
  };
  RenderDynamic = async function (): Promise<TextureRender> {
    this.StopRendering();
    //initial configuration
    const threeModule = await THREE.getThree();
    this.modelScene.camera = new threeModule.PerspectiveCamera();
    this.lastCameraOptionsKey = "";

    this.renderingActive = true;

    await this._loadCameraOptions();
    this._updateRenderSize();
    await this._applyTextureToModel();

    const module = await THREE.getOrbitalControls();
    this.orbitalControls = new module.OrbitControls(
      this.modelScene.camera,
      this.renderer.domElement
    );
    this.orbitalControls.enablePan = false;
    this.orbitalControls.maxDistance = 3.0;
    this.orbitalControls.minDistance = 0.75;

    this._render();
    return this;
  };
  StopRendering = function (): TextureRender {
    this.renderingActive = false;
    return this;
  };
  AddShadow = async function (): Promise<TextureRender> {
    if (this.shadowScene != null) return this;
    this.shadowsEnabled = true;

    const threeModule = await THREE.getThree();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = threeModule.PCFShadowMap;

    const pointLight = new threeModule.DirectionalLight(0xffffff, 0.78);

    pointLight.castShadow = true;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 500;
    pointLight.shadow.camera.left = -0.8;
    pointLight.shadow.camera.right = 0.8;
    pointLight.shadow.camera.top = 0.8;
    pointLight.shadow.camera.bottom = -0.8;
    pointLight.shadow.bias = -0.00001;
    pointLight.shadow.radius = 1;
    const mapSize = 1024;
    pointLight.shadow.mapSize.width = mapSize;
    pointLight.shadow.mapSize.height = mapSize;

    pointLight.target.position.set(0, 1, 0);
    pointLight.position.set(0, 10, -10);
    pointLight.shadowCameraVisible = true;
    this.modelScene.scene.add(pointLight);
    this.shadowScene = pointLight;

    return this;
  };
  RemoveShadow = function (): TextureRender {
    this.shadowsEnabled = false;
    this._removeSceneObject(this.shadowScene);
    this.shadowScene = null;
    return this;
  };
  AddFloor = async function (texture: string): Promise<TextureRender> {
    if (this.floorScene != null) return this;

    const threeModule = await THREE.getThree();
    const floorTexture = new threeModule.TextureLoader().load(texture);
    const floorGeometry = new threeModule.PlaneGeometry(3, 3, 3, 3);
    const floorMaterial = new threeModule.MeshStandardMaterial({
      map: floorTexture,
      side: threeModule.DoubleSide,
      roughness: 1,
    });
    const floor = new threeModule.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.modelScene.scene.add(floor);
    this.floorScene = floor;
    return this;
  };
  RemoveFloor = function (): TextureRender {
    this._removeSceneObject(this.floorScene);
    this.floorScene = null;
    return this;
  };
  SetBackground = function (color): TextureRender {
    if (this.renderer == null) return this;
    this.renderer.setClearColor(color, 1);
    return this;
  };
  RemoveBackground = async function (): Promise<TextureRender> {
    if (this.renderer == null) return this;

    const threeModule = await THREE.getThree();
    this.renderer.setClearColor(new threeModule.Color(0x000000), 0);
    return this;
  };
  SetCapeAsync = async function (capeTexture: string): Promise<TextureRender> {
    this.capeTexture = capeTexture;
    this._removeSceneObject(this.capeScene);
    const threeModule = await THREE.getThree();
    const loaderPromise: Promise<any> = new Promise((resolve) => {
      const capeLoader = new threeModule.ImageBitmapLoader();
      capeLoader.load(capeTexture, (texture) => {
        const canvasTexture = new threeModule.CanvasTexture(texture);
        canvasTexture.magFilter = threeModule.NearestFilter;
        canvasTexture.minFilter = threeModule.NearestFilter;
        resolve(canvasTexture);
      });
    });

    const capeTxt = await loaderPromise;

    const capeModel = await this._loadModelToTempScene(
      "data:model/gltf+json;base64," + btoa(capeModelData)
    );
    const material = new threeModule.MeshStandardMaterial({
      map: capeTxt,
    });
    capeModel.traverse((child: any) => {
      child.name = "Cape";
      if (child.isMesh) {
        if (this.shadowsEnabled) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        child.material = material;
        child.material.roughness = 1;
      }
    });
    this.capeScene = capeModel;
    await this._attachCapeToModel();
    await this._refreshAnimationDataIfRendering();

    return this;
  };
  RemoveCape = function (): TextureRender {
    this.capeTexture = null;
    const bodypart = this.modelScene.renderScene.getObjectByName("Body");
    bodypart.remove(this.capePivot);
    this.capePivot = null;
    this.capeScene = null;
    return;
  };
  AddAmbientLight = async function () {
    const threeModule = await THREE.getThree();
    const brightness = 1.2;
    const light = new threeModule.AmbientLight(0xffffff, brightness * 1.8, 10);

    //configure light
    this.modelScene.scene.add(light);
    this.ambientLight = light;
  };
  AddDirectionalLight = async function () {
    const threeModule = await THREE.getThree();
    const brightness = 1.2;
    const pointLight = new threeModule.DirectionalLight(
      0xffffff,
      brightness * 0.65,
      10
    );
    pointLight.position.set(0, 50, -50);
    this.modelScene.scene.add(pointLight);
    this.directionalLight = pointLight;
    return this;
  };
  RemoveDirectionalLight = function () {
    this._removeSceneObject(this.directionalLight);
    this.directionalLight = null;
    return this;
  };
  RemoveAmbientLight = function () {
    this._removeSceneObject(this.ambientLight);
    this.ambientLight = null;
    return this;
  };
  AddTextureAmbientLighting = async function () {
    const threeModule = await THREE.getThree();
    const ambient = new threeModule.AmbientLight(0xffffff, 3.14);
    this.modelScene.scene.add(ambient);
    this.ambientLight = ambient;
    return this;
  };
  async Resize() {
    if (this.renderer == null) return this;
    await this._loadCameraOptions();
    this._updateRenderSize();

    this._renderInNode();
    return this;
  }
}
export class ModelScene {
  model: string;
  name: string;
  camera: any;
  scene: any;
  renderScene: any;
  constructor(model: string, name: string) {
    this.model = model;
    this.name = name;
  }
  async Create() {
    //prepare scene

    const threeModule = await THREE.getThree();
    this.scene = new threeModule.Scene();
    this.camera = new threeModule.OrthographicCamera();
    const module = await THREE.getGLTFLoader();
    const modelLoader = new module.GLTFLoader();

    //set default values
    this.scene.position.y = -1;

    //load model
    this.renderScene = await new Promise((resolve) => {
      modelLoader.load(this.model, (gltf) => {
        gltf.scene.name = "model";
        this.scene.add(gltf.scene);
        resolve(gltf.scene);
      });
    });
    return this;
  }
  ResetPosition() {
    const renderScene: any = this.renderScene;
    renderScene.getObjectByName("RightArm").rotation.set(0, 0, 0);
    renderScene.getObjectByName("LeftArm").rotation.set(0, 0, 0);
    renderScene.getObjectByName("RightLeg").rotation.set(0, 0, 0);
    renderScene.getObjectByName("LeftLeg").rotation.set(0, 0, 0);
    renderScene.getObjectByName("Head").rotation.set(0, 0, 0);
    return this;
  }
  Clone() {
    const cloned = Object.assign({}, this);
    cloned.scene = this.scene.clone(true);
    cloned.renderScene.traverse((child: any) => {
      if (child.isMesh) {
        const mat = child.material;
        child.material = mat.clone();
      }
    });
    return cloned;
  }
}
export class RenderAnimationEngine {
  private animationsList: RenderAnimation[] = [];
  private currentAnimation: RenderAnimation = null;
  private animationData: any = null;
  private animationDataModelName: string = null;

  private isAnimationPrepared: boolean = false;
  private isAnimationQuiting: boolean = false;

  private animationQueueLimit: number = 2;

  private timer: any = null;
  private _mergeAnimationData = function (localAnimationData: any) {
    this.animationData = Object.assign(
      this.animationData || {},
      localAnimationData
    );
  };
  private _dequeueAnimation = function () {
    this.currentAnimation = this.animationsList.shift() ?? null;
  };
  private _resetCurrentAnimation = function () {
    this.isAnimationQuiting = false;
    this.isAnimationPrepared = false;
    this.animationData = null;
    this.currentAnimation = null;
  };
  private _getFrameTiming = function () {
    this.timer.update();
    const delta = Math.min(this.timer.getDelta(), 1);
    const elapsed = this.timer.getElapsed();
    return { delta, elapsed };
  };

  constructor() {}
  Create = async function () {
    const threeModule = await THREE.getThree();
    this.timer = new threeModule.Timer();
    return this;
  };
  PrepareAnimation = async function (
    sceneData: any,
    modelName,
    keepData: boolean,
    force = false
  ) {
    if (this.isAnimationPrepared && !force) return this;

    if (this.currentAnimation == null) this._dequeueAnimation();
    if (this.currentAnimation == null) return this;

    const localAnimationData = await this.currentAnimation.prepare(
      sceneData,
      keepData,
      modelName
    );

    this.animationDataModelName = modelName;
    this._mergeAnimationData(localAnimationData);

    this.isAnimationPrepared = true;
    return this;
  };
  AddAnimation = function (animation: RenderAnimation, force = false) {
    if (this.animationsList.length >= this.animationQueueLimit && !force) {
      return this;
    }

    if (this.animationsList.length >= this.animationQueueLimit) {
      this.animationsList[this.animationsList.length - 1] = animation;
      return this;
    }

    this.animationsList.push(animation);
    return this;
  };
  RenderAnimationFrame = async function () {
    const { delta, elapsed } = this._getFrameTiming();

    if (!this.isAnimationPrepared) {
      await this.PrepareAnimation(
        this.animationData,
        false,
        this.animationDataModelName
      );
    }

    const activeAnimation = this.currentAnimation;
    if (activeAnimation == null) return this;

    if (this.animationsList.length > 0) this.isAnimationQuiting = true;

    if (this.isAnimationQuiting) {
      const isAnimationFinishedQuiting = activeAnimation.stop(
        this.animationData,
        null,
        delta,
        this.animationDataModelName,
        elapsed
      );

      if (isAnimationFinishedQuiting) this._resetCurrentAnimation();
      return this;
    }

    activeAnimation.render(
      this.animationData,
      null,
      delta,
      this.animationDataModelName,
      elapsed
    );

    return this;
  };
  RefreshAnimationData = async function (sceneData: any, modelName) {
    if (this.currentAnimation == null) return this;

    const localAnimationData = await this.currentAnimation.prepare(
      sceneData,
      true,
      modelName
    );

    this._mergeAnimationData(localAnimationData);
    this.animationDataModelName = modelName;

    return this;
  };
}
export class OutfitPackageToTextureConverter {
  private outfitPackage: OutfitPackage;
  private model: string;
  private modelMap: any;
  private isMerging: boolean;
  private isFlatten: boolean;
  private layerId: string;
  private texture: string;
  private basetexture: string;
  private excludedPartsFromFlat: string[] = ["head"];
  private _getLayerContent = function (layer: OutfitLayer, model: MODEL_TYPE) {
    const primary = layer?.[model];
    if (primary?.content != null) return primary.content;
    if (primary?.contentSnapshot != null) return primary.contentSnapshot;

    const fallbackModel =
      model == MODEL_TYPE.ALEX ? MODEL_TYPE.STEVE : MODEL_TYPE.ALEX;
    const fallback = layer?.[fallbackModel];
    if (fallback?.content != null) return fallback.content;
    if (fallback?.contentSnapshot != null) return fallback.contentSnapshot;

    return null;
  };
  private _collectLayers = function (): string[] {
    const layers: string[] = [];
    if (this.basetexture != null) layers.push(this.basetexture);

    const selectedLayer = this.outfitPackage.layers.find((x) => x.id == this.layerId);
    const targetLayers =
      this.layerId == null || this.layerId == ""
        ? this.outfitPackage.layers
        : selectedLayer
          ? [selectedLayer]
          : [];

    for (const layer of targetLayers) {
      const content = this._getLayerContent(layer, this.model as MODEL_TYPE);
      if (content != null) layers.push(content);
    }

    return layers;
  };

  constructor() {}
  SetOutfitPackage = function (
    outfitPackage: OutfitPackage
  ): OutfitPackageToTextureConverter {
    this.outfitPackage = outfitPackage;
    return this;
  };
  SetBaseTexture = function (
    basetexture: string
  ): OutfitPackageToTextureConverter {
    this.basetexture = basetexture;
    return this;
  };
  SetOptions = function (
    options: OutfitPackageRenderConfig
  ): OutfitPackageToTextureConverter {
    this.outfitPackage = options.item;
    if (typeof options.baseTexture == "string")
      this.basetexture = options.baseTexture;
    else this.basetexture = options.baseTexture[options.item.model].content;
    this.layerId = options.selectedLayerId;
    this.model = options.item.model;
    this.isFlatten = options.isFlatten;
    this.excludedPartsFromFlat = options.excludedPartsFromFlat;
    this.modelMap =
      options.item.model == MODEL_TYPE.STEVE ? STEVE_MODEL : ALEX_MODEL;
    return this;
  };
  SetExcludedPartsFromFlat = function (
    excludedPartsFromFlat: string[]
  ): OutfitPackageToTextureConverter {
    this.excludedPartsFromFlat = excludedPartsFromFlat;
    return this;
  };
  SetModel = function (model: MODEL_TYPE): OutfitPackageToTextureConverter {
    this.model = model;
    this.modelMap = model == MODEL_TYPE.STEVE ? STEVE_MODEL : ALEX_MODEL;
    return this;
  };
  SetLayerId = function (layerId: string): OutfitPackageToTextureConverter {
    this.layerId = layerId;
    return this;
  };
  SetAsFlatten = function (): OutfitPackageToTextureConverter {
    this.isFlatten = true;
    return this;
  };
  SetAsNotFlatten = function (): OutfitPackageToTextureConverter {
    this.isFlatten = false;
    return this;
  };
  AsFlattenAsync = async function (): Promise<string> {
    this.isFlatten = true;
    const ctx = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true,
    });
    if (this.texture == null) return null;

    const loadedImage = await loadImageSafe(this.texture);
    if (loadedImage.img == null) {
      return this.texture;
    }

    //get canvas size
    ctx.canvas.width = loadedImage.img.width;
    ctx.canvas.height = loadedImage.img.height;

    ctx.drawImage(loadedImage.img, 0, 0);

    //flattening
    try {
      for (const part of Object.values(this.modelMap) as any[]) {
        if (
          part.outerTextureArea != null &&
          part.textureArea != null &&
          !this.excludedPartsFromFlat.includes(part.name)
        ) {
          flatPart(ctx, part);
        }
      }
      this.texture = ctx.canvas.toDataURL();
    } catch {
      // Keep original texture if flatten fails
    }
    return this.texture;
  };
  AsNotFlatten = function (): string {
    this.isFlatten = false;
    return this.texture;
  };
  GetTexture = function (): string {
    return this.texture;
  };
  GetModelMap = function (): any {
    return this.modelMap;
  };
  GetModel = function (): string {
    return this.model;
  };
  GetLayerId = function (): string {
    return this.layerId;
  };
  GetOutfitPackage = function (): OutfitPackage {
    return this.outfitPackage;
  };
  ConvertAsync = async function (): Promise<string> {
    const layers = this._collectLayers();

    if (layers.length == 0) {
      this.texture = null;
      return null;
    }

    this.texture =
      layers.length > 1 ? await mergeTextures(layers, this.modelMap) : layers[0];
    return this.texture;
  };
  ConvertAsyncWithFlattenSettingsAsync = async function (): Promise<string> {
    const texture = await this.ConvertAsync();
    if (texture == null) return null;
    if (this.isFlatten) await this.AsFlattenAsync();
    else await this.AsNotFlatten();
    return this.texture;
  };
  ConvertFromOptionsAsync = async function (
    options: OutfitPackageRenderConfig
  ): Promise<string> {
    this.SetOptions(options);
    return await this.ConvertAsyncWithFlattenSettingsAsync();
  };
}
type LoadedTexture = {
  textureSrc: string;
  img: HTMLImageElement | null;
};
const loadImageSafe = (textureSrc: string): Promise<LoadedTexture> => {
  return new Promise<LoadedTexture>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ textureSrc, img });
    img.onerror = () => resolve({ textureSrc, img: null });
    img.src = textureSrc;
  });
};
const mergeTextures = async function (textures: string[], modelMap) {
  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

  const images = await Promise.all(textures.map(loadImageSafe));
  const validImages = images.filter(
    (image): image is LoadedTexture & { img: HTMLImageElement } =>
      image.img != null
  );

  if (validImages.length === 0) return null;

  //get canvas size
  const getSize = function (dim: "width" | "height") {
    return Math.max(...validImages.map((image) => image.img[dim]));
  };

  canvas.width = getSize("width");
  canvas.height = getSize("height");

  //draw images
  validImages.forEach(function (image) {
    ctx.globalAlpha = 1;
    tempCtx.drawImage(image.img, 0, 0);

    //replace lower parts based on modelMap
    for (const part of Object.values(modelMap) as any[]) {
      if (part.outerTextureArea != null && part.textureArea != null) {
        replaceLowerLayerPart(tempCtx, ctx, part);
      }
    }

    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.drawImage(image.img, 0, 0);
  });

  try {
    return canvas.toDataURL();
  } catch {
    // If canvas fails, fallback to first valid texture
    return validImages[0]?.textureSrc ?? null;
  }
};
const replaceLowerLayerPart = function (imgContext, lowerLayerContext, part) {
  const imageData = imgContext.getImageData(
    part.textureArea.x,
    part.textureArea.y,
    part.textureArea.width,
    part.textureArea.height,
    {
      willReadFrequently: true,
    }
  );
  const sourcePixels = imageData.data;
  const destData = lowerLayerContext.getImageData(
    part.outerTextureArea.x,
    part.outerTextureArea.y,
    part.outerTextureArea.width,
    part.outerTextureArea.height,
    {
      willReadFrequently: true,
    }
  );
  const destPixels = destData.data;
  for (let i = 0; i < sourcePixels.length; i += 4) {
    const r = sourcePixels[i];
    const g = sourcePixels[i + 1];
    const b = sourcePixels[i + 2];
    //detect if is not empty
    if (r != 0 || g != 0 || b != 0) {
      destPixels[i] = 0;
      destPixels[i + 1] = 0;
      destPixels[i + 2] = 0;
      destPixels[i + 3] = 0;
    }
  }
  lowerLayerContext.putImageData(
    destData,
    part.outerTextureArea.x,
    part.outerTextureArea.y
  );
};
const flatPart = function (imgContext, part) {
  const imageData = imgContext.getImageData(
    part.textureArea.x,
    part.textureArea.y,
    part.textureArea.width,
    part.textureArea.height,
    {
      willReadFrequently: true,
    }
  );
  const outerImageData = imgContext.getImageData(
    part.outerTextureArea.x,
    part.outerTextureArea.y,
    part.outerTextureArea.width,
    part.outerTextureArea.height,
    {
      willReadFrequently: true,
    }
  );
  const sourcePixels = outerImageData.data;
  const destPixels = imageData.data;
  for (let i = 0; i < sourcePixels.length; i += 4) {
    const r = sourcePixels[i];
    const g = sourcePixels[i + 1];
    const b = sourcePixels[i + 2];
    //detect if is not empty
    if (r != 0 || g != 0 || b != 0) {
      destPixels[i] = r;
      destPixels[i + 1] = g;
      destPixels[i + 2] = b;
      destPixels[i + 3] = 255;
      //clear outer
      sourcePixels[i] = 0;
      sourcePixels[i + 1] = 0;
      sourcePixels[i + 2] = 0;
      sourcePixels[i + 3] = 0;
    }
  }
  imgContext.putImageData(
    outerImageData,
    part.outerTextureArea.x,
    part.outerTextureArea.y
  );
  imgContext.putImageData(imageData, part.textureArea.x, part.textureArea.y);
};
