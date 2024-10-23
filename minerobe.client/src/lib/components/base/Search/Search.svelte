<script lang="ts">
  import SearchIcon from "$icons/search.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import { createEventDispatcher } from "svelte";
  import Button from "../Button/Button.svelte";

  export let value = null;
  export let dense = true;
  export let style = "";
  export let clearable = true;
  export let placeholder = "Search";
  export let dark = false;

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

<div class="search" class:dense {style} class:dark>
  <input
    type="text"
    style="font-size: var(--size-font-caption);"
    {placeholder}
    bind:value
    class="search-input"
    on:input={onInput}
    on:keydown={onKeyDown}
  />
  {#if clearable && value}
    <Button
      onlyIcon
      icon={CloseIcon}
      type="secondary"
      size="auto"
      {dark}
      noBorder
      label="Clear"
      on:click={onClear}
    />
  {/if}
  <Button
    on:click={onSearch}
    onlyIcon
    size="auto"
    icon={SearchIcon}
    label="Search"
    noBorder={dense}
  />
</div>

<style lang="scss">
  @use "Search.scss";
</style>
