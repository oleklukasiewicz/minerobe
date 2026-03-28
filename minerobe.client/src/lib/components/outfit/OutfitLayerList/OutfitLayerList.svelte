<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //services
  import { ConvertFileToFileData } from "$src/data/import";
  //models
  import type { OutfitLayer } from "$data/models/package";
  import { MODEL_TYPE } from "$src/data/enums/model";
  //components
  import OutfitLayerListItem from "../OutfitLayerListItem/OutfitLayerListItem.svelte";
  import MultiDragAndDrop from "$lib/components/draganddrop/MultiDragAndDrop/MultiDragAndDrop.svelte";
  import Resize from "$lib/components/other/Resize/Resize.svelte";

  const dispatch = createEventDispatcher();

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
  }: Props = $props();

  const onSelect= function (layer: OutfitLayer) {
    if (!selectable) return;
    dispatch("select", { item: layer });
  };
  const onMoveUp= function (layer: OutfitLayer, index: number) {
    if (!movable) return;
    dispatch("moveUp", { item: layer, index: index });
  };
  const onMoveDown= function (layer: OutfitLayer, index: number) {
    if (!movable) return;
    dispatch("moveDown", { item: layer, index: index });
  };
  const onEdit= function (layer: OutfitLayer, index: number) {
    dispatch("edit", { item: layer, index: index });
  };
  const onDelete= function (layer: OutfitLayer, index: number) {
    dispatch("delete", { item: layer, index: index });
  };
  const onDrop= async function (layer: OutfitLayer, option: any) {
    const items = await ConvertFileToFileData(option.items[0]);
    dispatch("drop", { item: layer, option: option.option, file: items });
  };
  const onResize= function () {
    items = [...items];
  };
</script>

<div class="outfit-layer-list">
  <div class="outfit-layer-list-items" class:dense>
    {#each [...items].reverse() as item, index (item.id)}
      <MultiDragAndDrop
        on:drop={(e) => onDrop(item, e.detail)}
        disabled={!dropable || !editable || item.sourcePackageId != packageId}
        options={[
          { label: "Classic", value: MODEL_TYPE.STEVE },
          { label: "Slim", value: MODEL_TYPE.ALEX },
        ]}
      >
        <OutfitLayerListItem
          on:select={() => onSelect(item)}
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
          on:moveDown={() => onMoveDown(item, items.length - index - 1)}
          on:moveUp={() => onMoveUp(item, items.length - index - 1)}
          on:edit={() => onEdit(item, items.length - index - 1)}
          on:delete={() => onDelete(item, items.length - index - 1)}
        />
      </MultiDragAndDrop>
    {/each}
  </div>
  {#if resizable}
    <Resize debounce={resizeDebounce} on:resize={onResize} />
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
