<script lang="ts">
  //icons
  import CancelIcon from "$icons/close.svg?raw";
  import type { BaseDialogProps } from "$src/data/components";

  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  //icons

  interface ConfirmDialogProps  extends BaseDialogProps {
    message?: string;
    confirmLabel?: string;
    confirmIcon?: any;
    cancelLabel?: string;
    cancelIcon?: any;
    onconfirm?: (event?: any) => void;
    onclose?: (event?: any) => void;
  }

  let {
    open = $bindable(false),
    message = "Are you sure?",
    label = "Confirm",
    confirmLabel = "Yes",
    confirmIcon = null,
    cancelLabel = "Cancel",
    cancelIcon = CancelIcon
  ,
    onconfirm = null,
    onclose = null
  }: ConfirmDialogProps = $props();

  const onConfirm= () => {
    onconfirm?.();
  };
  const onCancel= () => {
    onclose?.();
  };
</script>

<Dialog bind:open {label}>
  <div id="confirm-dialog">
    <div class="mc-font-simple dialog-message">{message}</div>
    <div class="actions">
      <Button label={confirmLabel} icon={confirmIcon} onclick={onConfirm} />
      <Button
        label={cancelLabel}
        icon={cancelIcon}
        type={"tertiary"}
        onclick={onCancel}
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
