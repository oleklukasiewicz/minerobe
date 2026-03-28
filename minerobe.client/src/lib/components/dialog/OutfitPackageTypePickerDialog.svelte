<script lang="ts">
  //consts
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";

  //icons
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ListIcon from "$icons/list.svg?raw";

  import Dialog from "../base/Dialog/Dialog.svelte";
  //icons

  interface Props {
    open?: boolean;
    onselect?: (event?: any) => void;
  }

  let { open = $bindable(false) ,
    onselect = null
  }: Props = $props();
  const onSelect= function (item) {
    onselect?.({ detail: { type: item } });
  };
</script>

<Dialog bind:open label="Select type">
  <div id="outfit-type-dialog">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_missing_attribute -->
    <a class="type-item" onclick={() => onSelect(PACKAGE_TYPE.OUTFIT_SET)}>
      <div class="icon-big">{@html AnimationIcon}</div>
      <b>Set</b>
    </a>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_missing_attribute -->
    <a class="type-item" onclick={() => onSelect(PACKAGE_TYPE.OUTFIT)}>
      <div class="icon-big">{@html ShoppingBagIcon}</div>
      <b>Outfit</b>
    </a>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_missing_attribute -->
    <a
      class="type-item"
      onclick={() => onSelect(PACKAGE_TYPE.OUTFIT_COLLECTION)}
    >
      <div class="icon-big">{@html ListIcon}</div>
      <b>Collection</b>
    </a>
  </div>
</Dialog>

<style lang="scss">
  #outfit-type-dialog {
    padding: 8px;
    box-sizing: border-box;
    width: 100%;
    min-width: 40vw;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20%, 1fr));
    gap: 8px;
    .type-item {
      flex: 1;
      text-align: center;
      font-family: minecraft;
      display: flex;
      gap: 8px;
      flex-direction: column;
      padding-bottom: 8px;
      box-sizing: border-box;
      border: 2px solid transparent;
      div {
        aspect-ratio: 1;
        background-color: var(--color-theme-D1);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      &:hover {
        background-color: var(--color-accent);
        color: var(--color-accent-font);
        border-color: var(--color-accent-D2);
        div {
          background-color: var(--color-accent-D1);
        }
      }
      &:active {
        border-color: var(--color-active-D1);
        background-color: var(--color-active-D1);
        div {
          background-color: var(--color-active-D1);
        }
      }
    }
  }
</style>
