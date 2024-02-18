<script lang="ts">
  import CloseIcon from "$icons/close.svg?raw";
  import { createEventDispatcher } from "svelte";
  import { cubicOut } from "svelte/easing";
  import Button from "../Button/Button.svelte";
  export let message: string;
  export let type: "success" | "error" | "warning" | "info" = "info";
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
  <div class="content">
    {#if icon}
      <span class="icon">
        {icon}
      </span>
    {/if}
    <span class="message mc-font-simple">
      {message}
    </span>
    {#if closeable}
      <Button type="quaternary" altStyle on:click={onClose} icon={CloseIcon} onlyIcon />
    {/if}
  </div>
</div>

<style lang="scss">
  @import "Toast.scss";
</style>
