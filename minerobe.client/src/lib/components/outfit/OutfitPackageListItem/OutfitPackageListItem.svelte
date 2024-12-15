<script lang="ts">
  import ColorBadge from "$lib/components/other/ColorBadge/ColorBadge.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";

  import HeartSmallIcon from "$icons/small/heart-micro.svg?raw";
  import DownloadSmallIcon from "$icons/small/download-micro.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";

  import type { OutfitLayer, OutfitPackage } from "$data/models/package";
  import { normalizeNumber } from "$src/helpers/data/dataHelper";

  import { onMount } from "svelte";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";

  export let item: OutfitPackage;
  export let layerId: string = null;
  export let baseTexture: OutfitLayer | string = null;
  export let layerCount = 2;
  export let style = "";
  export let currentItem = false;
  export let moreLayersIndicator = true;

  export let fetchLayer = async function (id, item): Promise<OutfitLayer> {
    return null;
  };
  export let resize = async () => {};

  let initialized = false;
  let currentLayer: OutfitLayer;

  const setCurrentLayer = async function (v) {
    const targetId = layerId || item?.layers[0]?.id;
    let targetLayer = item.layers.find((x) => x.id == targetId);
    if (targetLayer?.isLoaded == false) {
      targetLayer = await fetchLayer(targetId, item);
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

  onMount(async () => {
    await setCurrentLayer(item);
    initialized = true;
  });
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a {style} class="outfit-package-list-item" on:click>
  <div class="render">
    <div class="render-flags">
      {#if currentItem}
        <span class="current-item icon">{@html LoaderIcon}</span>
      {/if}
    </div>
    {#if initialized}
      <OutfitPackageRender
        bind:resize
        source={item}
        layerId={currentLayer?.id}
        isDynamic={false}
        isFlatten={true}
        {baseTexture}
      />
    {/if}
    <div class="colors">
      {#each item.layers.slice(0, layerCount) as layer}
        <ColorBadge
          selected={currentLayer?.id == layer.id}
          color={layer.colorName}
          colorName={layer.colorName}
          on:click={async () => await updateLayerId(layer.id)}
        />
      {/each}
      {#if item.totalLayersCount > layerCount && moreLayersIndicator && item.type != PACKAGE_TYPE.OUTFIT_SET}
        <span class="more">+{item.totalLayersCount - layerCount}</span>
      {/if}
    </div>
  </div>
  <div class="data">
    <span class="title">{item.name}</span>
    <div class="social">
      {#if item.social?.likes > 0}
        <div>
          <span class="icon">
            {@html HeartSmallIcon}
          </span>
          {normalizeNumber(item.social.likes)}
        </div>
      {/if}
      {#if item.social?.downloads > 0}
        <div>
          <span class="icon">
            {@html DownloadSmallIcon}
          </span>
          {normalizeNumber(item.social.downloads)}
        </div>
      {/if}
    </div>
  </div>
</a>

<style lang="scss">
  @use "OutfitPackageListItem.scss";
</style>
