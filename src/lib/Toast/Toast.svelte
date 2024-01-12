<script lang="ts">
  import CloseIcon from "$icons/close.svg?raw";
  import { createEventDispatcher } from "svelte";
  import { cubicOut } from "svelte/easing";
  export let message: string;
  export let duration: number = 3000;
  export let type: "success" | "error" | "warning" | "info" = "info";
  export let position: "top" | "bottom" | "center" = "bottom";
  export let mobile = false;
  export let show: boolean = false;
  export let icon: string = "";
  export const closeable: boolean = true;

  const dispatch = createEventDispatcher();

  function fadeInScale(node, { duration }) {
    return {
      duration,
      easing: cubicOut,
      css: (t) => `opacity: ${t}; transform: scale(${0.9 + t * 0.1})`,
    };
  }
  const onClose = () => {
    dispatch("close");
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="toast"
  class:success={type === "success"}
  class:error={type === "error"}
  class:warning={type === "warning"}
  class:info={type === "info"}
  class:hidden={!show}
  on:click
  class:mobile
  in:fadeInScale={{ duration: 300 }}
  out:fadeInScale={{ duration: 300 }}
>
  {#if icon}
    <span class="icon">
      {icon}
    </span>
  {/if}
  <span class="message mc-font">
    {message}
  </span>
  {#if closeable}
    <button class="tertiary small icon icon-small" on:click={onClose}
      >{@html CloseIcon}</button
    >
  {/if}
</div>

<style lang="scss">
  @import "Toast.scss";
</style>
