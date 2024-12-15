import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderAnimation } from "./animation";
import { ALEX_MODEL, STEVE_MODEL } from "./consts/model";
import { DEFAULT_RENDERER } from "./static";
import type { OutfitLayer, OutfitPackage } from "$data/models/package";
import type { OutfitPackageRenderConfig } from "$data/models/render";
import { MODEL_TYPE } from "./enums/model";
import { t } from "svelte-i18n";
export class CameraConfig {
  rotation: THREE.Vector3;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  lookAtEnabled: boolean;
  fov: number;
  zoom: number;
  constructor(
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    lookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    zoom: number = 1,
    fov: number = 1,
    lookAtEnabled: boolean = false,
    rotation: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ) {
    this.fov = fov;
    this.position = position;
    this.lookAt = lookAt;
    this.lookAtEnabled = lookAtEnabled;
    this.rotation = rotation;
    this.zoom = zoom;
  }
}
export class TextureRender {
  private renderer: any;
  private model: any;
  private texture: string;
  private node: any;
  private cameraOptions: any;
  private modelScene: ModelScene;
  private textureLoader: any;
  private loadedTexture: any;
  private animations: RenderAnimation[] = [];
  private animationQueueLimit: number = 3;
  private renderingActive: boolean = false;
  private shadowsEnabled: boolean = false;
  private shadowScene: any = null;
  private floorScene: boolean = null;
  private temporaryRenderNode: any = null;

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
    if (this.loadedTexture == null) return;
    this.modelScene.renderScene.traverse((child: any) => {
      if (child.isMesh) {
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
    if (this.modelScene == null) return;
    let options = new CameraConfig();
    if (!this.renderingActive) {
      options = this.cameraOptions || new CameraConfig();
    } else {
      options = new CameraConfig(
        new THREE.Vector3(0, 0, -2),
        undefined,
        undefined,
        75
      );
    }
    this.modelScene.camera.position.x = options.position.x;
    this.modelScene.camera.position.y = options.position.y;
    this.modelScene.camera.position.z = options.position.z;
    this.modelScene.camera.rotation.x = options.rotation.x;
    this.modelScene.camera.rotation.y = options.rotation.y;
    this.modelScene.camera.rotation.z = options.rotation.z;
    this.modelScene.camera.lookAt(options.lookAt);
    this.modelScene.camera.fov = options.fov;
    this.modelScene.camera.zoom = options.zoom;
  };
  private _render = function (_self = this) {
    if (!_self.renderingActive) return;
    //frame rendering
    const _clockActualDelta = this.clock.getDelta();
    const _clockDelta = _clockActualDelta > 1 ? 1 : _clockActualDelta;
    const _clockElapsedTime = this.clock.getElapsedTime();

    //animations
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
  private _prepareAnimation(
    animation: RenderAnimation,
    keepData: boolean,
    force = false
  ) {
    if (this.animationPrepared && !force) return;
    const animationData = animation.prepare(
      this.modelScene.renderScene,
      keepData
    );
    this.animationData = Object.assign(this.animationData || {}, animationData);
    this.animationPrepared = true;
  }
  private _updateRenderSize = function () {
    const canvas = this.node;
    const width = canvas.clientWidth != 0 ? canvas.clientWidth : 300;
    const height = canvas.clientHeight != 0 ? canvas.clientHeight : 300;
    const canvasSizeMultiplier = 1;
    const fov = 1;
    if (this.renderer == null) return;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      width * fov * canvasSizeMultiplier,
      height * fov * canvasSizeMultiplier
    );
    this.modelScene.camera.aspect = width / height;
    this.modelScene.camera.updateProjectionMatrix();
  };
  private _renderInNode = function () {
    const renderNode = this.temporaryRenderNode || this.node;
    renderNode.appendChild(this.renderer.domElement);

    this.renderer.render(this.modelScene.scene, this.modelScene.camera);

    const dataUrl = this.renderer.domElement.toDataURL();
    this.node.src = dataUrl;

    renderNode.removeChild(this.renderer.domElement);
  };

  constructor(renderer: any = DEFAULT_RENDERER) {
    this.renderer = renderer;
    this.textureLoader = new THREE.TextureLoader();
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
    if (this.renderingActive) await this._applyTextureToModel();
    if (this.animations.length > 0 && this.renderingActive)
      this._prepareAnimation(this.animations[0], true, true);
    return this;
  };
  SetTextureAsync = async function (texture: string): Promise<TextureRender> {
    this.texture = texture;
    this.loadedTexture = await this._loadTexture();
    if (this.renderingActive) await this._applyTextureToModel();
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
  SetCameraOptions = function (cameraOptions: any): TextureRender {
    this.cameraOptions = cameraOptions;
    return this;
  };
  AddAnimation = function (
    animation: RenderAnimation,
    force: boolean
  ): TextureRender {
    if (this.animations.length >= this.animationQueueLimit) {
      if (!force) return this;
      this.animations.splice(this.animations.length - 1, 1, animation);
    }
    this.animations.push(animation);
    return this;
  };
  SetAnimationsLimit = function (limit: number): TextureRender {
    this.animationQueueLimit = limit;
    return this;
  };
  RenderStatic = async function (): Promise<TextureRender> {
    if (this.renderer == null) return this;

    this._loadCameraOptions();
    this._updateRenderSize();
    await this._applyTextureToModel();

    this._renderInNode();
    return this;
  };
  RenderDynamic = async function (): Promise<TextureRender> {
    this.StopRendering();
    //initial configuration
    this.modelScene.camera = new THREE.PerspectiveCamera();

    this.renderingActive = true;

    this._loadCameraOptions();
    this._updateRenderSize();
    await this._applyTextureToModel();

    this.clock = new THREE.Clock();
    this.orbitalControls = new OrbitControls(
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
    this.clock = null;
    return this;
  };
  AddShadow = function (): TextureRender {
    if (this.shadowScene != null) return this;
    this.shadowsEnabled = true;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const pointLight = new THREE.DirectionalLight(0xffffff, 0.78);

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
    if (this.shadowScene != null)
      this.modelScene.scene.remove(this.shadowScene);
    this.shadowScene = null;
    return this;
  };
  AddFloor = function (texture: string): TextureRender {
    if (this.floorScene != null) return this;
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
    this.floorScene = floor;
    return this;
  };
  RemoveFloor = function (): TextureRender {
    if (this.floorScene != null) this.modelScene.scene.remove(this.floorScene);
    this.floorScene = null;
    return this;
  };
  SetBackground = function (color: THREE.Color): TextureRender {
    if (this.renderer == null) return this;
    this.renderer.setClearColor(color, 1);
    return this;
  };
  RemoveBackground = function (): TextureRender {
    if (this.renderer == null) return this;
    this.renderer.setClearColor(new THREE.Color(0x000000), 0);
    return this;
  };
  async Resize() {
    if (this.renderer == null) return this;
    this._loadCameraOptions();
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
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera();

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
        const mat = child.material as THREE.MeshStandardMaterial;
        child.material = mat.clone();
      }
    });
    return cloned;
  }
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
    const modelMap = this.modelMap;
    const ctx = document.createElement("canvas").getContext("2d");
    //create image
    var Image = window.Image;
    var img = new Image();
    img.src = this.texture;
    //await for img to laod in promise
    const loadedImg: any = await new Promise((resolve) => {
      img.onload = () => {
        resolve({ img: img });
      };
    });
    //get canvas size
    ctx.canvas.width = loadedImg.img.width;
    ctx.canvas.height = loadedImg.img.height;

    ctx.drawImage(loadedImg.img, 0, 0);
    //flattening
    const modelMapKeys = Object.keys(modelMap);
    for (let i = 0; i < modelMapKeys.length; i++) {
      let part = modelMap[modelMapKeys[i]];
      if (
        part.outerTextureArea != null &&
        part.textureArea != null &&
        !this.excludedPartsFromFlat.includes(part.name)
      )
        flatPart(ctx, part);
    }
    this.texture = ctx.canvas.toDataURL();
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
  }
  GetOutfitPackage = function (): OutfitPackage {
    return this.outfitPackage;
  };
  ConvertAsync = async function (): Promise<string> {
    //set modelMap
    const modelMap = this.modelMap;
    //load target layers
    const layers: string[] = [];
    if (this.basetexture != null) layers.push(this.basetexture);
    if (this.layerId == null || this.layerId == "") {
      //load all layers
      this.outfitPackage.layers.forEach((layer: OutfitLayer) => {
        if (this.model == MODEL_TYPE.STEVE) layers.push(layer.steve.content);
        else layers.push(layer.alex.content);
      });
    } else {
      //load single
      const layer: OutfitLayer = this.outfitPackage.layers.find(
        (x) => x.id == this.layerId
      );
      if (this.model == MODEL_TYPE.STEVE) layers.push(layer?.steve?.content);
      else layers.push(layer?.alex?.content);
    }

    let texture = layers[0];
    if (layers.length > 1) {
      //merge all layers
      texture = await mergeTextures(layers, modelMap);
    }
    this.texture = texture;
    return texture;
  };
  ConvertAsyncWithFlattenSettingsAsync = async function (): Promise<string> {
    await this.ConvertAsync();
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
const mergeTextures = async function (textures: string[], modelMap) {
  const canvas = document.createElement("canvas");
  const windowImage = window.Image;

  //load textures to canvas
  var layerPromises = textures.map(async (texture) => {
    return new Promise((resolve) => {
      const img = new windowImage();
      img.src = texture;
      img.onload = () => {
        return resolve(Object.assign({}, texture, { img: img }));
      };
      img.src = texture;
    });
  });

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

  const images = await Promise.all(layerPromises);

  //get canvas size
  const getSize = function (dim) {
    return Math.max.apply(
      Math,
      images.map(function (image: any) {
        if (image?.img == null) return 0;
        return image.img[dim];
      })
    );
  };

  canvas.width = getSize("width");
  canvas.height = getSize("height");

  //draw images
  images.forEach(function (image: any) {
    ctx.globalAlpha = 1;
    tempCtx.drawImage(image.img, 0, 0);
    //replace lower parts based on modelMap
    const modelMapKeys = Object.keys(modelMap);
    for (let i = 0; i < modelMapKeys.length; i++) {
      let part = modelMap[modelMapKeys[i]];
      if (part.outerTextureArea != null && part.textureArea != null)
        replaceLowerLayerPart(tempCtx, ctx, part);
    }

    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.drawImage(image.img, 0, 0);
  });

  return canvas.toDataURL();
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
