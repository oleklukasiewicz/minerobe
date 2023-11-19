<script lang="ts">
  import {loginUser} from "$data/auth";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  onMount(async () => {
    await loginUser();
  });
</script>
