<script lang="ts">
  //main imports
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
    onclear?: (event?: any) => void;
    oninput?: (event?: any) => void;
    onsearch?: (event?: any) => void;
  }

  let {
    value = $bindable(),
    dense = true,
    style = "",
    clearable = true,
    placeholder = "Search",
    dark = false
  ,
    onclear = null,
    oninput = null,
    onsearch = null
  }: Props = $props();

  const onKeyDown= (e) => {
    if (e.key === "Enter") {
      onSearch(e);
    }
  };

  const onClear= () => {
    value = "";
    onclear?.({ detail: value });
  };

  const onInput= (e) => {
    oninput?.({ detail: value });
  };
  const onSearch= (e) => {
    onsearch?.({ detail: value });
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
