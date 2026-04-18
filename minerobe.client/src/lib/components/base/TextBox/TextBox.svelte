<script lang="ts">
  //icons
  import CloseIcon from "$icons/close.svg?raw";
  import type { BaseProps } from "$src/data/components";

  import Button from "../Button/Button.svelte";
  //icons

  interface TextBoxProps extends BaseProps {
    value?: string;
    clearable?: boolean;
    placeholder?: string;
    oninput?: (event?: any) => void;
  }

  let {
    value = $bindable(""),
    clearable = false,
    placeholder = "",
    disabled = false,
    oninput = null,
  }: TextBoxProps = $props();

  const handleInput = (event) => {
    oninput?.({ value: event.target.value });
  };
  const clear = () => {
    value = "";
    oninput?.({ value: "" });
  };
</script>

<div class="text-box">
  <input bind:value oninput={handleInput} {placeholder} class:disabled />
  {#if clearable && value?.length > 0}
    <Button
      onlyIcon
      style="height: 32px;border-left:2px solid var(--color-theme-D6);"
      icon={CloseIcon}
      type="secondary"
      iconSize="auto"
      noBorder
      onclick={clear}
    ></Button>
  {/if}
</div>

<style lang="scss">
  @use "TextBox.scss";
</style>
