<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  //main imports
  import { createEventDispatcher } from "svelte";
  //components
  import Button from "../Button/Button.svelte";
  //icons
  import CloseIcon from "$icons/close.svg?raw";
  import { IS_MOBILE_VIEW } from "$src/data/static";

  const dispatch = createEventDispatcher();

  interface Props {
    open?: boolean;
    style?: string;
    label?: string;
    showTitleBar?: boolean;
    className?: string;
    children?: import('svelte').Snippet<[any]>;
  }

  let {
    open = $bindable(false),
    style = "",
    label = "",
    showTitleBar = true,
    className = "",
    children
  }: Props = $props();

  const onClose= () => {
    open = false;
    dispatch("close");
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dialog {className}"
  class:open
  onclick={onClose}
  class:mobile={$IS_MOBILE_VIEW}
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#if open}
    <div
      class="dialog-content"
      onclick={(event) => {
        event.stopPropagation();
        bubble('click')(event);
      }}
    >
      {#if showTitleBar}
        <div class="dialog-title-bar">
          <span>{label || ""}</span>
          <Button
            type="quaternary"
            icon={CloseIcon}
            label="Close"
            iconSize="large"
            onlyIcon
            onclick={onClose}
          />
        </div>
      {/if}
      <div class="dialog-content-container" {style}>
        {@render children?.({ isMobile: $IS_MOBILE_VIEW, })}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use "Dialog.scss";
</style>
