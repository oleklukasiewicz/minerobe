<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { Cape } from "$data/models/integration/minecraft";
  //components
  import CapeListItem from "../CapeListItem/CapeListItem.svelte";

  const dispatch = createEventDispatcher();

  export let items: Cape[];
  export let selectedCapeId: string;
  export let readonly: boolean = false;

  const onSelect = function (item: Cape) {
    selectedCapeId = item?.id;
    dispatch("select", { item: item });
  };
</script>

<div class="cape-list">
  {#each items as item}
    <CapeListItem
      {readonly}
      {item}
      selected={item.id === selectedCapeId}
      on:click={() => onSelect(item)}
    />
  {/each}
  {#if !readonly}
    <CapeListItem
      {readonly}
      selected={selectedCapeId === undefined || selectedCapeId === null}
      on:click={() => onSelect(null)}
    />
  {/if}
</div>

<style lang="scss">
  .cape-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
