<script lang="ts">
  //services
  import { normalizeNumber } from "$src/helpers/data/dataHelper";

  //consts
  import { OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/enums/outfit";

  //models
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";

  //components
  import ColorBadge from "$lib/components/other/ColorBadge/ColorBadge.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";

  //icons
  import HeartSmallIcon from "$icons/small/heart-micro.svg?raw";
  import DownloadSmallIcon from "$icons/small/download-micro.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";

  import { onMount } from "svelte";
  //api
  //services
  //consts
  //model
  //components
  //icons


  interface Props {
    item: OutfitPackage;
    layerId?: string;
    baseTexture?: OutfitLayer | string;
    layerCount?: number;
    style?: string;
    currentItem?: boolean;
    moreLayersIndicator?: boolean;
    selectable?: boolean;
    selected?: boolean;
    fetchLayer?: any;
    resize?: any;
    onselect?: (event?: any) => void;
    onclick?: (event?: any) => void;
  }

  let {
    item = $bindable(),
    layerId = $bindable(null),
    baseTexture = null,
    layerCount = 2,
    style = "",
    currentItem = false,
    moreLayersIndicator = true,
    selectable = false,
    selected = $bindable(false),
    fetchLayer = async function (id, item): Promise<OutfitLayer> {
    return null;
  },
    resize = $bindable()
  ,
    onselect = null,
    onclick = null
  }: Props = $props();

  let initialized = $state(false);
  let currentLayer: OutfitLayer = $state();
  let renderComponent = $state(null);
  let loadedLayersById = $state({});

  const renderedItem = $derived(
    item
      ? {
          ...item,
          layers: item.layers.map((layer) => loadedLayersById[layer.id] ?? layer),
        }
      : null
  );

  $effect(() => {
    resize = async () => {
      await renderComponent?.resize?.();
    };
  });

  const hasLayerTexture = (layer?: OutfitLayer) => {
    return !!(layer?.alex?.content || layer?.steve?.content);
  };

  const shouldFetchLayer = (layer?: OutfitLayer) => {
    return layer == null || layer?.isLoaded === false || !hasLayerTexture(layer);
  };

  const setCurrentLayer = async function (v) {
    const targetId = layerId || item?.layers[0]?.id;
    if (!renderedItem) return;

    if (!targetId) {
      currentLayer = renderedItem.layers?.[0];
      return;
    }

    let targetLayer = renderedItem.layers.find((x) => x.id == targetId);
    if (shouldFetchLayer(targetLayer)) {
      try {
        // Add timeout to fetch to prevent infinite hanging
        const fetchPromise = fetchLayer(targetId, item);
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve(null), 5000)
        );
        const fetchedLayer = await Promise.race([
          fetchPromise,
          timeoutPromise,
        ]);
        if (fetchedLayer != null) {
          loadedLayersById = {
            ...loadedLayersById,
            [targetId]: fetchedLayer,
          };
          targetLayer = fetchedLayer;
        }
      } catch (error) {
        console.warn("Failed to fetch layer:", targetId, error);
      }
    }
    currentLayer = targetLayer ?? renderedItem.layers?.[0];
  };
  const updateLayerId = async function (id) {
    layerId = id;
    await setCurrentLayer(item);
  };

  onMount(async () => {
    await setCurrentLayer(item);
    // Ensure fetch completes before rendering to avoid blank textures
    initialized = true;
  });

  const onSelectionChange= async function (e) {
    e.preventDefault();
    e.stopPropagation();
    onselect?.({ value: selected });
  };
  const onClick= async function (e) {
    e.preventDefault();
    e.stopPropagation();
    onclick?.({ item: item, layer: currentLayer });
  };
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<a
  {style}
  class="outfit-package-list-item"
  onclick={onClick}
  class:selected={selectable && selected}
>
  <div class="render">
    <div class="render-flags">
      {#if selectable}
        <Checkbox bind:value={selected} onchange={onSelectionChange} />
      {/if}
      {#if currentItem}
        <span class="current-item icon">{@html LoaderIcon}</span>
      {/if}
    </div>
    {#if initialized}
      <OutfitPackageRender
        bind:this={renderComponent}
        source={renderedItem}
        outfitType={renderedItem.type == PACKAGE_TYPE.OUTFIT_SET
          ? OUTFIT_TYPE.OUTFIT_SET
          : currentLayer?.outfitType || item.outfitType}
        layerId={renderedItem.type == PACKAGE_TYPE.OUTFIT_SET
          ? null
          : currentLayer?.id}
        isDynamic={false}
        {baseTexture}
      />
    {/if}
    <div class="colors">
      {#if renderedItem.type == PACKAGE_TYPE.OUTFIT_SET}
        <ColorBadge
          selected
          color={renderedItem.colorName || renderedItem.layers[0]?.colorName}
          colorName={renderedItem.colorName || renderedItem.layers[0]?.colorName}
        />
      {:else}
        {#each renderedItem.layers.slice(0, layerCount) as layer}
          <ColorBadge
            selected={currentLayer?.id == layer.id}
            color={layer.colorName}
            colorName={layer.colorName}
            onclick={async () => await updateLayerId(layer.id)}
          />
        {/each}
      {/if}
      {#if renderedItem.totalLayersCount > layerCount && moreLayersIndicator && renderedItem.type != PACKAGE_TYPE.OUTFIT_SET}
        <span class="more">+{renderedItem.totalLayersCount - layerCount}</span>
      {/if}
    </div>
  </div>
  <div class="data">
    <span class="title">{renderedItem.name}</span>
    <div class="social">
      {#if renderedItem.social?.likes > 0 && renderedItem.social?.isShared}
        <div>
          <span class="icon">
            {@html HeartSmallIcon}
          </span>
          {normalizeNumber(renderedItem.social.likes)}
        </div>
      {/if}
      {#if renderedItem.social?.downloads > 0 && renderedItem.social?.isShared}
        <div>
          <span class="icon">
            {@html DownloadSmallIcon}
          </span>
          {normalizeNumber(renderedItem.social.downloads)}
        </div>
      {/if}
    </div>
  </div>
</a>

<style lang="scss">
  @use "OutfitPackageListItem.scss";
</style>
