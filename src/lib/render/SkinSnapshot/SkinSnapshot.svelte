<script>
  import SkinRender from "../SkinRender/SkinRender.svelte";
  export let texture = null;
  export let model = null;
</script>

<div>
  <SkinRender
    {texture}
    {model}
    sceneRotY={Math.PI * 0.75}
    sceneRotX={Math.PI / 4}
    cameraPosZ={1.8}
    cameraPosY={0.1}
    orbitControlsEnabled={false}
    backgroundColorOpacity={0}
    renderFloor={false}
  />
</div>
