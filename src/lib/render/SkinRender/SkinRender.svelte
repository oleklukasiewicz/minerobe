<script lang="ts">
  import { onMount } from "svelte";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import * as THREE from "three";
  import type { RenderAnimation } from "$src/data/animation";

  // Replace with the path to your 3D model and texture
  export let model: Object;
  export let modelName: string = "";
  export let texture: any;
  export let sceneRotX = 0;
  export let sceneRotY = Math.PI;
  export let cameraPosZ = 2.2;
  export let cameraPosY = 0;
  export let cameraPosX = 0;
  export let orbitControlsEnabled = true;
  export let backgroundColor = "black";
  export let backgroundColorOpacity = 1;
  export let renderFloor = true;
  export let renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
  });
  export let animation: RenderAnimation = null;

  export const refreshRender = function () {
    render();
  };
  export const changeAnimation: Function = async function (
    anim: RenderAnimation
  ) {
    nextAnimation.push(anim);
  };
  export let onlyRenderSnapshot = false;

  let scene: any;
  let camera: any;
  let controls: any;
  let imgNode: any;
  let hiddenNode: any;

  const textureLoader = new THREE.TextureLoader();
  const loader = new GLTFLoader();
  let clock = new THREE.Clock();

  let skinRenderNode: any;
  let loadedRender: any;

  let animationData: any;
  let animationPrepared = false;
  let animationQuiting = false;

  let nextAnimation: RenderAnimation[] = [];

  const render = function () {
    if (skinRenderNode != null) {
      const canvas = skinRenderNode;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!onlyRenderSnapshot) requestAnimationFrame(render);
      if (controls) controls.update();
      renderer.setSize(width, height, false);
      if (nextAnimation.length > 0 && animation != null && animationPrepared) {
        animationQuiting = true;
      }
      if (animation) {
        if (animationPrepared == false) {
          prepareAnimation(animation, false);
        } else {
          if (animationData != null) {
            if (animationQuiting) {
              var finished = animation.stop(
                animationData,
                loadedRender,
                clock,
                modelName
              );
              if (finished) {
                animationQuiting = false;
                animationPrepared = false;
                animationData = null;
                animation = nextAnimation[0];
                nextAnimation.splice(0, 1);
              }
            } else
              animation.render(animationData, loadedRender, clock, modelName);
          }
        }
      } else {
        if (nextAnimation.length > 0) {
          animationQuiting = false;
          animationPrepared = false;
          animationData = null;
          animation = nextAnimation[0];
          nextAnimation.splice(0, 1);
        }
      }
      renderer.render(scene, camera);
      if (!onlyRenderSnapshot) {
        skinRenderNode.appendChild(renderer.domElement);
      } else {
        if (hiddenNode) hiddenNode.appendChild(renderer.domElement);
        imgNode.src = renderer.domElement.toDataURL();
      }
    }
  };
  const onWindowResize = function () {
    let width;
    let height;
    if (skinRenderNode) {
      width = skinRenderNode.clientWidth;
      height = skinRenderNode.clientHeight;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };

  const updateRender = function (textureToLoad, modelToLoad) {
    const modelPromise = new Promise((resolve) => {
      loader.load(modelToLoad, (gltf) => {
        resolve(gltf);
      });
    });

    // Create a new promise that resolves when the texture has loaded
    const texturePromise = new Promise((resolve) => {
      textureLoader.load(textureToLoad, (texture) => {
        resolve(texture);
      });
    });

    // Wait for both promises to resolve
    Promise.all([modelPromise, texturePromise]).then(([gltfP, textureSP]) => {
      scene.remove(loadedRender);
      let gltf: any = gltfP;
      let textureS: any = textureSP;

      loadedRender = gltf.scene;

      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          // Set texture filtering and wrap mode to improve sharpness
          textureS.magFilter = THREE.NearestFilter;
          textureS.minFilter = THREE.LinearMipmapLinearFilter;
          textureS.wrapS = THREE.RepeatWrapping;
          textureS.wrapT = THREE.RepeatWrapping;
          textureS.repeat.set(1, 1);

          child.material.map = textureS;
        }
      });
      scene.add(gltf.scene);

      if (onlyRenderSnapshot) render();
      if (animation) prepareAnimation(animation, true);
    });
  };

  const prepareAnimation = function (anim, keepData = false) {
    if (!loadedRender) {
      return;
    }
    if (anim) {
      let data;
      if (keepData && animationPrepared) {
        data = anim.prepare(loadedRender, true, modelName);
        if (animationData != null) Object.assign(animationData, data);
      } else {
        data = anim.prepare(loadedRender, false, modelName);
        animationData = data;
      }
      clock.start();
      animationPrepared = true;
    }
  };
  const updateAnimation = function (anim) {
    animationPrepared = false;

    prepareAnimation(anim, false);
  };
  onMount(async () => {
    // Create a scene
    scene = new THREE.Scene();
    scene.position.y = -1;
    scene.rotation.y = sceneRotY;
    scene.rotation.x = sceneRotX;
    scene.position.y = -1;

    // Create a camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = cameraPosZ;
    camera.position.y = cameraPosY;
    camera.position.x = cameraPosX;

    // Create a renderer
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.useLegacyLights = false;
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = 1;
    renderer.setClearColor(backgroundColor, backgroundColorOpacity);

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

    // Add orbit controls
    if (orbitControlsEnabled) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.maxDistance = 3.0;
      controls.minDistance = 0.5;
    }
    if (renderFloor) {
      //add scene floor
      const floorGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
      const floorMaterial = new THREE.MeshBasicMaterial({
        color: 0x5f5f5f,
        side: THREE.DoubleSide,
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = Math.PI / 2;
      floor.position.y = 0;
      scene.add(floor);
    }
    window.addEventListener("resize", onWindowResize);
    onWindowResize();
    render();
  });

  $: updateAnimation(animation);
  $: updateRender(texture, model);
</script>

<div class="skin-render" bind:this={skinRenderNode}>
  {#if onlyRenderSnapshot}
    <img bind:this={imgNode} />
    <div class="hidden" bind:this={hiddenNode} />
  {/if}
</div>

<style lang="scss">
  @import "SkinRender.scss";
</style>
