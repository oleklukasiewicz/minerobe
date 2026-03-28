<script lang="ts">
  //main imports
    //components
  import Button from "../Button/Button.svelte";
  //icons
  import CloseIcon from "$icons/close.svg?raw";

  interface Props {
    value?: string;
    clearable?: boolean;
    placeholder?: string;
    oninput?: (event?: any) => void;
  }

  let { value = $bindable(""), clearable = false, placeholder = "" ,
    oninput = null
  }: Props = $props();

  const handleInput = (event) => {
    oninput?.({ detail: event.target.value });
  };
  const clear = () => {
    value = "";
    oninput?.({ detail: "" });
  };
</script>

<div class="text-box">
  <input bind:value oninput={handleInput} {placeholder} />
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
