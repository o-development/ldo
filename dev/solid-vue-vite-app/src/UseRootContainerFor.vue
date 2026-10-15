<script setup lang="ts">
import type { SolidLeafUri, SolidContainerUri } from "@ldo/connected-solid";
import { ref } from "vue";
import { useRootContainerFor } from "./ldo";

const uri = ref<SolidLeafUri | SolidContainerUri>(
  "https://timbl.solidcommunity.net/profile/card",
);

const rootContainer = useRootContainerFor(uri);
</script>

<template>
  <h2>useRootContainerFor(uri, options?)</h2>

  <input v-model="uri" />

  <div>{{ rootContainer?.uri }}</div>
</template>
