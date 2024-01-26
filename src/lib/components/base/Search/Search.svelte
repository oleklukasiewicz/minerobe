<script lang="ts">
  import SearchIcon from "$icons/search.svg?raw";
  import { createEventDispatcher } from "svelte";

  export let value = null;
  export let dense = true;

  const dispatch = createEventDispatcher();

  const onInput = (e) => {
    dispatch("input", value);
  };
  const onSearch = (e) => {
    dispatch("search", value);
  };
</script>

<div class="search" class:dense>
  <input
    type="text"
    placeholder="Search"
    bind:value
    class="search-input"
    on:input={onInput}
  />
  <button class="icon icon-small" class:small={dense} on:click={onSearch}>
    {@html SearchIcon}
  </button>
</div>

<style lang="scss">
  @import "Search.scss";
</style>
