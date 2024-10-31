<script lang="ts">
  import type { OutfitLayer } from "$src/model/package";
  import { createEventDispatcher } from "svelte";
  import OutfitLayerListItem from "../OutfitLayerListItem/OutfitLayerListItem.svelte";
  import MultiDragAndDrop from "$lib/components/draganddrop/MultiDragAndDrop/MultiDragAndDrop.svelte";
  import { MODEL_TYPE } from "$src/data/consts";

  const dispatch = createEventDispatcher();

  export let items: OutfitLayer[];
  export let model: "alex" | "steve";
  export let selectedLayerId: string = "";
  export let selectable: boolean = true;
  export let movable: boolean = true;
  export let editable: boolean = true;
  export let removable: boolean = true;
  export let dropable: boolean = false;

  const onSelect = function (layer: OutfitLayer) {
    if (!selectable) return;
    dispatch("select", { item: layer });
  };
  const onMoveUp = function (layer: OutfitLayer) {
    if (!movable) return;
    dispatch("moveUp", { item: layer });
  };
  const onMoveDown = function (layer: OutfitLayer) {
    if (!movable) return;
    dispatch("moveDown", { item: layer });
  };
  const onEdit = function (layer: OutfitLayer) {
    dispatch("edit", { item: layer });
  };
  const onDelete = function (layer: OutfitLayer) {
    dispatch("delete", { item: layer });
  };
  const onDrop = function (layer: OutfitLayer, option: any) {
    dispatch("drop", { item: layer, option: option });
  };
</script>

<div class="outfit-layer-list">
  {#each items as item, index (item.id)}
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
        {removable}
        {editable}
        canUp={index > 0}
        canDown={index < items.length - 1}
        on:moveDown={() => onMoveDown(item)}
        on:moveUp={() => onMoveUp(item)}
        on:edit={() => onEdit(item)}
        on:delete={() => onDelete(item)}
      />
    </MultiDragAndDrop>
  {/each}
</div>

<style lang="scss">
  .outfit-layer-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
