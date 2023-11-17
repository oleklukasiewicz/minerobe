<script lang="ts">
  import { signInWithGoogle } from '$src/data/firebase';
    import type { PageData } from './$types';
    
    export let data: PageData;
    signInWithGoogle();
</script>