<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //components
  import Button from "../Button/Button.svelte";
  //icons
  import CloseIcon from "$icons/close.svg?raw";

  export let value = "";
  export let clearable = false;
  export let placeholder = "";

  const dispatch = createEventDispatcher();

  const handleInput = (event) => {
    dispatch("input", event.target.value);
  };
  const clear = () => {
    value = "";
    dispatch("input", "");
  };
</script>

<div class="text-box">
  <input bind:value on:input={handleInput} {placeholder} />
  {#if clearable && value?.length > 0}
    <Button
      onlyIcon
      style="height: 32px;border-left:2px solid var(--color-theme-D6);"
      icon={CloseIcon}
      type="secondary"
      iconSize="auto"
      noBorder
      on:click={clear}
    ></Button>
  {/if}
</div>

<style lang="scss">
  @use "TextBox.scss";
</style>
