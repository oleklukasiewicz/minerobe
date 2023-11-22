<script lang="ts">
  import ItemSnapshot from "$lib/ItemSnapshot/ItemSnapshot.svelte";
  import { alexModel, steveModel, wardrobe } from "$src/data/cache";
  import { onMount } from "svelte";
  import * as THREE from "three";

  let layersRenderer: THREE.WebGLRenderer = null;

  let loaded = false;
  onMount(() => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });
    loaded = true;
  });
</script>
<div class="outfits-list">
{#if loaded && $wardrobe != null}
  {#each $wardrobe.outfits as item}
    <ItemSnapshot
      renderer={layersRenderer}
      texture={item.layers[0]}
      model={item.model != "alex" ? $steveModel : $alexModel}
      modelName={item.model}
      metadata={item.metadata}
    />
  {/each}
{/if}
</div>
<style lang="scss">
  @import "style.scss";
</style>