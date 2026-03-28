<script lang="ts">
  //services
  import { ConvertFileToFileData } from "$src/data/import";

  //consts
  import { MODEL_TYPE } from "$src/data/enums/model";

  //models
  import type { OutfitLayer } from "$data/models/package";

  //components
  import MultiDragAndDrop from "$lib/components/draganddrop/MultiDragAndDrop/MultiDragAndDrop.svelte";
  import Resize from "$lib/components/other/Resize/Resize.svelte";

  import OutfitLayerListItem from "../OutfitLayerListItem/OutfitLayerListItem.svelte";

  interface Props {
    items: OutfitLayer[];
    packageId?: string;
    model: MODEL_TYPE;
    selectedLayerId?: string;
    selectable?: boolean;
    movable?: boolean;
    editable?: boolean;
    readonly?: boolean;
    removable?: boolean;
    dropable?: boolean;
    resizable?: boolean;
    dense?: boolean;
    primaryLayerId?: string;
    resizeDebounce?: number;
    link?: any;
    onselect?: (event?: any) => void;
    onmoveUp?: (event?: any) => void;
    onmoveDown?: (event?: any) => void;
    onedit?: (event?: any) => void;
    ondelete?: (event?: any) => void;
    ondrop?: (event?: any) => void;
  }

  let {
    items = $bindable(),
    packageId = null,
    model,
    selectedLayerId = "",
    selectable = true,
    movable = true,
    editable = true,
    readonly = false,
    removable = true,
    dropable = false,
    resizable = false,
    dense = false,
    primaryLayerId = null,
    resizeDebounce = 300,
    link = null
  ,
    onselect = null,
    onmoveUp = null,
    onmoveDown = null,
    onedit = null,
    ondelete = null,
    ondrop = null
  }: Props = $props();

  const onSelect= function (layer: OutfitLayer) {
    if (!selectable) return;
    onselect?.({ detail: { item: layer } });
  };
  const onMoveUp= function (layer: OutfitLayer, index: number) {
    if (!movable) return;
    onmoveUp?.({ detail: { item: layer, index: index } });
  };
  const onMoveDown= function (layer: OutfitLayer, index: number) {
    if (!movable) return;
    onmoveDown?.({ detail: { item: layer, index: index } });
  };
  const onEdit= function (layer: OutfitLayer, index: number) {
    onedit?.({ detail: { item: layer, index: index } });
  };
  const onDelete= function (layer: OutfitLayer, index: number) {
    ondelete?.({ detail: { item: layer, index: index } });
  };
  const onDrop= async function (layer: OutfitLayer, option: any) {
    const items = await ConvertFileToFileData(option.items[0]);
    ondrop?.({ detail: { item: layer, option: option.option, file: items } });
  };
  const onResize= function () {
    items = [...items];
  };
</script>

<div class="outfit-layer-list">
  <div class="outfit-layer-list-items" class:dense>
    {#each [...items].reverse() as item, index (item.id)}
      <MultiDragAndDrop
        ondrop={(e) => onDrop(item, e.detail)}
        disabled={!dropable || !editable || item.sourcePackageId != packageId}
        options={[
          { label: "Classic", value: MODEL_TYPE.STEVE },
          { label: "Slim", value: MODEL_TYPE.ALEX },
        ]}
      >
        <OutfitLayerListItem
          onselect={() => onSelect(item)}
          link={item.sourcePackageId != packageId && link != null
            ? link + item.sourcePackageId + "/" + item.id
            : null}
          {dense}
          {item}
          {readonly}
          selected={item.id == selectedLayerId}
          {model}
          {packageId}
          {movable}
          {removable}
          isPrimary={item.id === primaryLayerId}
          editable={(packageId != null
            ? item.sourcePackageId == packageId
            : true) && editable}
          canUp={index > 0}
          canDown={index < items.length - 1}
          onmoveDown={() => onMoveDown(item, items.length - index - 1)}
          onmoveUp={() => onMoveUp(item, items.length - index - 1)}
          onedit={() => onEdit(item, items.length - index - 1)}
          ondelete={() => onDelete(item, items.length - index - 1)}
        />
      </MultiDragAndDrop>
    {/each}
  </div>
  {#if resizable}
    <Resize debounce={resizeDebounce} onresize={onResize} />
  {/if}
</div>

<style lang="scss">
  .outfit-layer-list {
    display: flex;
    .outfit-layer-list-items {
      flex: 1;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      &.dense {
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  }
</style>
