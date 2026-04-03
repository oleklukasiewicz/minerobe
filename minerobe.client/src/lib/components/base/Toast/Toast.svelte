<script lang="ts">
  //icons
  import CloseIcon from "$icons/close.svg?raw";
  //main imports
  import { cubicOut } from "svelte/easing";
  //components
  import Button from "../Button/Button.svelte";
  //icons

  interface ToastProps {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    mobile?: boolean;
    show?: boolean;
    icon?: string;
    closeable?: boolean;
    onclose?: (event?: any) => void;
    onclick?: (event?: any) => void;
  }

  let {
    message,
    type = "info",
    mobile = false,
    show = false,
    icon = "",
    closeable = true,
    onclose = null,
    onclick = null,
  }: ToastProps = $props();

  function fadeInScale(node, { duration }) {
    return {
      duration,
      easing: cubicOut,
      css: (t) => `opacity: ${t}; transform: scale(${0.9 + t * 0.1})`,
    };
  }
  const onClose = () => {
    onclose?.();
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="toast"
  class:success={type === "success"}
  class:error={type === "error"}
  class:warning={type === "warning"}
  class:info={type === "info"}
  class:hidden={!show}
  {onclick}
  class:mobile
  in:fadeInScale={{ duration: 300 }}
  out:fadeInScale={{ duration: 300 }}
>
  <div class="content">
    <div class="data">
      {#if icon}
        <span class="icon icon-small">
          {@html icon}
        </span>
      {/if}
      <span class="message mc-font-simple">
        {message}
      </span>
    </div>
    {#if closeable}
      <Button
        type="quaternary"
        whiteText
        onclick={onClose}
        icon={CloseIcon}
        onlyIcon
      />
    {/if}
  </div>
</div>

<style lang="scss">
  @use "Toast.scss";
</style>
