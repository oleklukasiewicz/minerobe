<script lang="ts">
  import { login } from "$data/firebase";
  import type { PageData } from "./$types";

  export let data: PageData;

  function QuickSort(ar, lewy, prawy) {
    let i = lewy;
    let j = prawy;
    let x = ar[Math.floor((lewy + prawy) / 2)];
    do {
      while (ar[i] < x) i++;
      while (ar[j] > x) j--;
      if (i <= j) {
        let w = ar[i];
        ar[i] = ar[j];
        ar[j] = w;
        i++;
        j--;
      }
    } while (i <= j);
    if (lewy < j) QuickSort(ar, lewy, j);
    if (i < prawy) QuickSort(ar, i, prawy);
    console.log("XXXXXXXX")
    return ar;
  }

  console.log(
    [2, 1, 3, 5, 4, 8, 7, 6, 9, 10],
    QuickSort(
      [2, 1, 3, 5, 4, 8, 7, 6, 9, 10],
      0,
      [2, 1, 3, 5, 4, 6, 7, 8, 9, 10].length - 1
    )
  );
</script>
