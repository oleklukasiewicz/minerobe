<script lang="ts">
  //api
  import { GetLayer } from "$src/api/pack";

  //consts
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";

  //models
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";

  //components
  import Resize from "$lib/components/other/Resize/Resize.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";

  import OutfitPackageListItem from "../OutfitPackageListItem/OutfitPackageListItem.svelte";

  interface Props {
    items: OutfitPackage[];
    baseTexture?: OutfitLayer | string;
    columns?: number;
    resizable?: boolean;
    resizeDebounce?: number;
    currentPackageId?: string;
    loading?: boolean;
    pageSize?: number;
    selectable?: boolean;
    onselect?: (event?: any) => void;
  }

  let {
    items,
    baseTexture = null,
    columns = -1,
    resizable = true,
    resizeDebounce = 300,
    currentPackageId = null,
    loading = false,
    pageSize = 10,
    selectable = false
  ,
    onselect = null
  }: Props = $props();

  let _component: any = $state(null);
  const selectOutfit = function (e) {
    const item = e.item;
    const layer = e.layer;
    onselect?.({ item: item, layer: layer });
  };
  const fetchLayer = async function (id, item): Promise<OutfitLayer> {
    return await GetLayer(id);
  };
  let renderList: any[] = $state([]);

  const onResize= async function () {
    for (let i = 0; i < items.length; i++) {
      await renderList[i]();
    }
  };
</script>

<div class="outfit-package-list" bind:this={_component}>
  <div
    class="outfit-package-list-items"
    style={`grid-template-columns: repeat(${columns > 0 ? "auto-fill" : "auto-fit"}, minmax(max(5px, ${columns > 0 ? `calc((100% / ${columns}) - 4px)` : "128px"}),1fr));`}
  >
    {#if loading}
      {#each Array(pageSize || 10) as _}
        <Placeholder width="100%" aspectRatio={"0.73"} height="100%" />
      {/each}
    {:else}
      {#each items as item, index (item.id + item?.layers[0]?.id)}
        <OutfitPackageListItem
          {selectable}
          bind:resize={renderList[index]}
          currentItem={currentPackageId == item.id}
          {item}
          {fetchLayer}
          onclick={selectOutfit}
          baseTexture={item.type == PACKAGE_TYPE.OUTFIT_SET
            ? baseTexture
            : null}
        />
      {/each}
    {/if}
  </div>
  {#if resizable}
    <Resize
      debounce={resizeDebounce}
      onresize={onResize}
      targetNode={_component}
    />
  {/if}
</div>

<style lang="scss">
  .outfit-package-list {
    .outfit-package-list-items {
      max-width: 100%;
      display: grid;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
</style>
