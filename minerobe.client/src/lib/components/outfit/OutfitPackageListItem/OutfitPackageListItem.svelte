<script lang="ts">
  import ColorBadge from "$lib/components/other/ColorBadge/ColorBadge.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import { GetLayerSnapshot } from "$src/api/pack";
  import { PACKAGE_TYPE } from "$src/data/consts";
  import type { OutfitLayer, OutfitPackage } from "$src/model/package";
  import { onMount } from "svelte";

  export let item: OutfitPackage;
  export let layerId: string = null;
  export let baseTexture: string = null;
  export let layerCount = 2;
  export let style = "";

  let initialized = false;
  let currentLayer: OutfitLayer;

  const setCurrentLayer = async function (v) {
    const targetId = layerId || item.layers[0].id;
    let targetLayer = item.layers.find((x) => x.id == targetId);
    if (targetLayer?.isLoaded == false) {
      targetLayer = await GetLayerSnapshot(targetId);
      //update in item
      item.layers = item.layers.map((x) =>
        x.id == targetId ? targetLayer : x
      );
    }
    currentLayer = targetLayer;
  };
  const updateLayerId = async function (id) {
    layerId = id;
    await setCurrentLayer(item);
  };

  $: setCurrentLayer(item);

  onMount(async () => {
    await setCurrentLayer(item);
    initialized = true;
  });
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a {style} class="outfit-package-list-item">
  <div class="render">
    <div class="render-flags"></div>
    {#if initialized}
      {#if currentLayer.isSnapshot}
        <img src={currentLayer[item.model]?.content} />
      {:else}
        <OutfitPackageRender
          source={item}
          layerId={currentLayer?.id}
          isDynamic={false}
          isFlatten={true}
          baseTexture={item.type == PACKAGE_TYPE.OUTFIT_SET
            ? baseTexture
            : null}
        />
      {/if}
    {/if}
    <div class="colors">
      {#each item.layers.slice(0, layerCount) as layer}
        <ColorBadge
          color={layer.colorName}
          on:click={async () => await updateLayerId(layer.id)}
        />
      {/each}
      {#if item.totalLayersCount > layerCount && item.type == PACKAGE_TYPE.OUTFIT}
        <span class="more">+{item.totalLayersCount - layerCount}</span>
      {/if}
    </div>
  </div>
  <div class="data">
    <span class="title">{item.name}</span>
  </div>
</a>

<style lang="scss">
  @import "OutfitPackageListItem.scss";
</style>
