<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //components
  import Button from "../Button/Button.svelte";
  //icons
  import SearchIcon from "$icons/search.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";

  interface Props {
    value?: any;
    dense?: boolean;
    style?: string;
    clearable?: boolean;
    placeholder?: string;
    dark?: boolean;
  }

  let {
    value = $bindable(null),
    dense = true,
    style = "",
    clearable = true,
    placeholder = "Search",
    dark = false
  }: Props = $props();

  const dispatch = createEventDispatcher();

  const onKeyDown= (e) => {
    if (e.key === "Enter") {
      onSearch(e);
    }
  };

  const onClear= () => {
    value = "";
    dispatch("clear", value);
  };

  const onInput= (e) => {
    dispatch("input", value);
  };
  const onSearch= (e) => {
    dispatch("search", value);
  };
</script>

<div class="search" class:dense {style} class:dark>
  <input
    type="text"
    {placeholder}
    bind:value
    class="search-input"
    oninput={onInput}
    onkeydown={onKeyDown}
  />
  {#if clearable && value}
    <Button
      onlyIcon
      icon={CloseIcon}
      type="secondary"
      size="auto"
      noBorder
      label="Clear"
      onclick={onClear}
    />
  {/if}
  <Button
    onclick={onSearch}
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
