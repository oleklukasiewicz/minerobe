<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //components
  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  //icons
  import CancelIcon from "$icons/close.svg?raw";

  const dispatch = createEventDispatcher();

  interface Props {
    open?: boolean;
    message?: string;
    label?: string;
    confirmLabel?: string;
    confirmIcon?: any;
    cancelLabel?: string;
    cancelIcon?: any;
  }

  let {
    open = $bindable(false),
    message = "Are you sure?",
    label = "Confirm",
    confirmLabel = "Yes",
    confirmIcon = null,
    cancelLabel = "Cancel",
    cancelIcon = CancelIcon
  }: Props = $props();

  const onConfirm= () => {
    dispatch("confirm");
  };
  const onCancel= () => {
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
      font-size: var(--size-font-caption);
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  }
</style>
