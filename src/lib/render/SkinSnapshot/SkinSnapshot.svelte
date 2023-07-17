<script>
  import SkinRender from "../SkinRender/SkinRender.svelte";
  export let texture = null;
  export let model = null;
</script>

<div>
  <SkinRender
    {texture}
    {model}
    sceneRotY={Math.PI * 0.8}
    sceneRotX={Math.PI / 4}
    cameraPosZ={1.6}
    cameraPosY={0.1}
    orbitControlsEnabled={false}
    backgroundColorOpacity={0}
  />
</div>
