<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //model
  import type { OutfitLayer } from "$src/model/package";
  import { MODEL_TYPE } from "$src/data/consts/model";
  //components
  import OutfitLayerListItem from "../OutfitLayerListItem/OutfitLayerListItem.svelte";
  import MultiDragAndDrop from "$lib/components/draganddrop/MultiDragAndDrop/MultiDragAndDrop.svelte";
  import Resize from "$lib/components/other/Resize/Resize.svelte";
  
  const dispatch = createEventDispatcher();

  export let items: OutfitLayer[];
  export let model: MODEL_TYPE;
  export let selectedLayerId: string = "";
  export let selectable: boolean = true;
  export let movable: boolean = true;
  export let editable: boolean = true;
  export let removable: boolean = true;
  export let dropable: boolean = false;
  export let resizable: boolean = false;
  export let resizeDebounce = 300;

  const onSelect = function (layer: OutfitLayer) {
    if (!selectable) return;
    dispatch("select", { item: layer });
  };
  const onMoveUp = function (layer: OutfitLayer, index: number) {
    if (!movable) return;
    dispatch("moveUp", { item: layer, index: index });
  };
  const onMoveDown = function (layer: OutfitLayer, index: number) {
    if (!movable) return;
    dispatch("moveDown", { item: layer, index: index });
  };
  const onEdit = function (layer: OutfitLayer, index: number) {
    dispatch("edit", { item: layer, index: index });
  };
  const onDelete = function (layer: OutfitLayer, index: number) {
    dispatch("delete", { item: layer, index: index });
  };
  const onDrop = function (layer: OutfitLayer, option: any) {
    dispatch("drop", { item: layer, option: option });
  };
  const onResize = function () {
    items = [...items];
  };
</script>

<div class="outfit-layer-list">
  <div class="outfit-layer-list-items">
    {#each [...items].reverse() as item, index (item.id)}
      <MultiDragAndDrop
        on:drop={(e) => onDrop(item, e.detail.option)}
        disabled={!dropable || !editable}
        options={[
          { label: "Classic", value: MODEL_TYPE.STEVE },
          { label: "Slim", value: MODEL_TYPE.ALEX },
        ]}
      >
        <OutfitLayerListItem
          on:click={() => onSelect(item)}
          {item}
          selected={item.id == selectedLayerId}
          {model}
          {movable}
          {removable}
          {editable}
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
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }
</style>
