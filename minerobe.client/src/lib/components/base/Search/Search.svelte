<script lang="ts">
  import SearchIcon from "$icons/search.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import { createEventDispatcher } from "svelte";
  import Button from "../Button/Button.svelte";

  export let value = null;
  export let dense = true;
  export let clearable = true;

  const dispatch = createEventDispatcher();

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch(e);
    }
  };

  const onClear = () => {
    value = "";
    dispatch("clear", value);
  };

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
    style="font-size: var(--size-font-caption);"
    placeholder="Search"
    bind:value
    class="search-input"
    on:input={onInput}
    on:keydown={onKeyDown}
  />
  {#if clearable && value}
    <Button
      onlyIcon
      flat
      size="small"
      icon={CloseIcon}
      type="secondary"
      label="Clear"
      style="padding: 2px 3px;"
      on:click={onClear}
    />
  {/if}
  <Button
    on:click={onSearch}
    onlyIcon
    size="small"
    icon={SearchIcon}
    label="Search"
    style="padding: 1px 2px 1px 5px;"
  />
</div>

<style lang="scss">
  @import "Search.scss";
</style>
