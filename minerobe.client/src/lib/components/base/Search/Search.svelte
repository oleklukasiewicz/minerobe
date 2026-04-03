<script lang="ts">
  //icons
  import SearchIcon from "$icons/search.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";

  import Button from "../Button/Button.svelte";
  import type { BaseProps } from "$src/data/components";
  //icons

  interface SearchProps extends BaseProps {
    value?: any;
    dense?: boolean;
    style?: string;
    clearable?: boolean;
    placeholder?: string;
    dark?: boolean;
    onclear?: (event?: any) => void;
    oninput?: (event?: any) => void;
    onsearch?: (event?: any) => void;
  }

  let {
    value = $bindable(),
    dense = true,
    disabled = false,
    style = "",
    clearable = true,
    placeholder = "Search",
    dark = false,
    onclear = null,
    oninput = null,
    onsearch = null,
  }: SearchProps = $props();

  const onKeyDown = (e) => {
    if (e.key === "Enter") onSearch(e);
  };

  const onClear = () => {
    value = "";
    onclear?.({ value });
  };

  const onInput = (e) => oninput?.({ value });
  const onSearch = (e) => onsearch?.({ value });
</script>

<div class="search" class:dense {style} class:dark class:disabled>
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
