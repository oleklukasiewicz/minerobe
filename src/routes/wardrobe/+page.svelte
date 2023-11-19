<script lang="ts">
  import { wardrobe } from "$src/data/cache";
  import { onMount } from "svelte";

  onMount(()=>
  {
    console.log($wardrobe)
  })
</script>
