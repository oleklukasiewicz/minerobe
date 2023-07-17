<script lang="ts">
  import SkinSnapshot from "$lib/render/SkinSnapshot/SkinSnapshot.svelte";

  export let texture = null;
  export let model = null;

  const regex = /\/([\w\s()-]+)\.(png|PNG)$/;
</script>

<div class="item-layer">
  <SkinSnapshot {texture} {model} />
  <span>{texture.match(regex)[1]}</span>
</div>
<style lang="scss">
  @import "ItemLayer.scss";
</style>