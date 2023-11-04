<script>
  import SkinRender from "../SkinRender/SkinRender.svelte";
  export let texture = null;
  export let model = null;
  export let renderer = undefined;
  export let refreshRender = undefined;
</script>

<div>
  <SkinRender
    {texture}
    {model}
    bind:refreshRender={refreshRender}
    sceneRotY={Math.PI * 0.75}
    sceneRotX={Math.PI / 4}
    cameraPosZ={1.8}
    cameraPosY={0.1}
    orbitControlsEnabled={false}
    backgroundColorOpacity={0}
    renderFloor={false}
    {renderer}
    onlyRenderSnapshot={true}
  />
</div>
