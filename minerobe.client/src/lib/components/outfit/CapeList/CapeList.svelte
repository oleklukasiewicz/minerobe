<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { Cape } from "$src/model/integration/minecraft";
  //components
  import CapeListItem from "../CapeListItem/CapeListItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: Cape[];
  export let selectedCapeId: string;

  const onSelect = function (item: Cape) {
    selectedCapeId = item?.id;
    dispatch("select", { item: item });
  };
</script>

<div class="cape-list">
  {#each items as item}
    <CapeListItem
      {item}
      selected={item.id === selectedCapeId}
      on:click={() => onSelect(item)}
    />
  {/each}
  <CapeListItem
    selected={selectedCapeId === undefined || selectedCapeId === null}
    on:click={() => onSelect(null)}
  />
</div>

<style lang="scss">
  .cape-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
