<script lang="ts">
  import { myExampleFunction, myReactiveStore } from "@ldo/svelte";

  let message = "Testing @ldo/svelte library!";

  myExampleFunction();
  myReactiveStore();

  // Example of using a function from your library
  // if (typeof myExampleFunction === 'function') {
  //   message = myExampleFunction();
  // }

  // Example of subscribing to a store from your library
  // let storeValue: any;
  // if (myReactiveStore && typeof myReactiveStore.subscribe === 'function') {
  //   const unsubscribe = myReactiveStore.subscribe(value => {
  //     storeValue = value;
  //   });
  //   // Clean up subscription on component destroy
  //   import { onDestroy } from 'svelte';
  //   onDestroy(unsubscribe);
  // }
</script>

<main>
  <h1>@ldo/svelte Example App</h1>
  <p>{message}</p>
</main>
