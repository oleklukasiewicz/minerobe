<script lang="ts">
  import { onMount } from "svelte";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import * as THREE from "three";

  // Replace with the path to your 3D model and texture
  export let model: Object;
  export let texture: any;
  export let sceneRotX = 0;
  export let sceneRotY = Math.PI;
  export let cameraPosZ = 3;
  export let cameraPosY = 0;
  export let cameraPosX = 0;
  export let orbitControlsEnabled = true;
  export let backgroundColor = "black";
  export let backgroundColorOpacity = 1;

  let scene: any;
  let camera: any;
  let renderer: any;
  let controls: any;

  const loader = new GLTFLoader();

  let skinRenderNode: any;
  let loadedRender: any;

  let updateRender = function (textureToLoad, modelToLoad) {
    try {
      loader.load(modelToLoad, (gltf: any) => {
        const textureS = new THREE.TextureLoader().load(textureToLoad);
        //removing ol render model
        scene.remove(loadedRender);

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
      });
    } catch (e) {
      console.log(e);
    }
  };

  onMount(async () => {
    texture;

    // Create a scene
    scene = new THREE.Scene();
    scene.position.y = -1;
    scene.rotation.y = sceneRotY;
    scene.rotation.x = sceneRotX;
    scene.position.y = -0.65;

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
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = 1;
    skinRenderNode.appendChild(renderer.domElement);

    // Load the model and texture
    updateRender(texture, model);

    // Add a directional light
    const light = new THREE.AmbientLight(0xffffff, 3);
    scene.add(light);

    // Set the floor color
    renderer.setClearColor(backgroundColor, backgroundColorOpacity);

    // Add orbit controls
    if (orbitControlsEnabled) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.maxDistance = 3.0;
      controls.minDistance = 0.5;
    }

    // Render the scene
    const animate = function () {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      renderer.render(scene, camera);
    };
    animate();
    function onWindowResize() {
      const width = skinRenderNode.clientWidth;
      const height = skinRenderNode.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", onWindowResize);
    onWindowResize();
  });

  $: updateRender(texture, model);
</script>

<div class="skin-render" bind:this={skinRenderNode} />

<style lang="scss">
  @import "SkinRender.scss";
</style>
