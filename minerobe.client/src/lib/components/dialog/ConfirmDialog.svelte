<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //components
  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  //icons
  import CancelIcon from "$icons/close.svg?raw";

  const dispatch = createEventDispatcher();

  export let open = false;
  export let message = "Are you sure?";
  export let label = "Confirm";
  export let confirmLabel = "Yes";
  export let confirmIcon = null;
  export let cancelLabel = "Cancel";
  export let cancelIcon = CancelIcon;

  const onConfirm = () => {
    dispatch("confirm");
  };
  const onCancel = () => {
    dispatch("close");
  };
</script>

<Dialog bind:open {label}>
  <div id="confirm-dialog">
    <div class="mc-font-simple dialog-message">{message}</div>
    <div class="actions">
      <Button label={confirmLabel} icon={confirmIcon} on:click={onConfirm} />
      <Button
        label={cancelLabel}
        icon={cancelIcon}
        type={"tertiary"}
        on:click={onCancel}
      />
    </div>
  </div>
</Dialog>

<style lang="scss">
  #confirm-dialog {
    text-align: center;
    .dialog-message {
      margin: 0px 2px 16px;
      font-size: var(--size-font-base);
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  }
</style>
