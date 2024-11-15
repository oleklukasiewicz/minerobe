<script lang="ts">
  import type { Cape } from "$src/model/integration/minecraft";
  import { createEventDispatcher } from "svelte";
  import CapeListItem from "../CapeListItem/CapeListItem.svelte";

  export let items: Cape[];
  export let selectedCapeId: string;

  const dispatch = createEventDispatcher();

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
