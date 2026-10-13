<script setup lang="ts">
import { computed, ref, triggerRef } from "vue";
import { useResource } from "./ldo.js";
import type { SolidContainerUri, SolidLeafUri } from "@ldo/connected-solid";
import type { UseResourceOptions } from "@ldo/vue";

const uri = ref<SolidLeafUri | SolidContainerUri>(
  "https://timbl.solidcommunity.net/profile/",
);
const subscribe = ref(false);
const reloadOnMount = ref(false);
const suppressInitialRead = ref(true);

const options = computed<UseResourceOptions<"solid">>(() => ({
  subscribe: subscribe.value,
  reloadOnMount: reloadOnMount.value,
  suppressInitialRead: suppressInitialRead.value,
}));

const resource = useResource(uri, options);

const handleReadManually = async () => {
  await resource.value.read();
};

const handleRefresh = () => {
  triggerRef(resource);
};
</script>

<template>
  <h2>useResource</h2>

  <div class="controls">
    <label>uri: <input v-model="uri" placeholder="uri" size="50" /></label>
    <button @click="handleReadManually">read manually</button>
    <button @click="handleRefresh">refresh resource results</button>
    <label
      ><input v-model="suppressInitialRead" type="checkbox" />
      suppressInitialRead</label
    >
    <label
      ><input v-model="reloadOnMount" type="checkbox" /> reloadOnMount</label
    >
    <label><input type="checkbox" v-model="subscribe" /> subscribe</label>
  </div>

  <div class="results" v-if="resource">
    <div>isDoingInitialFetch: {{ resource.isDoingInitialFetch() }}</div>
    <div>isLoading: {{ resource.isLoading() }}</div>
    <div>isReloading: {{ resource.isReloading() }}</div>
    <div>isFetched: {{ resource.isFetched() }}</div>
    <div>isUnfetched: {{ resource.isUnfetched() }}</div>
    <div>isAbsent: {{ resource.isAbsent() }}</div>
    <div>isPresent: {{ resource.isPresent() }}</div>
    <div>status: {{ resource.status.type }}</div>
    <div>
      isSubscribedToNotifications: {{ resource.isSubscribedToNotifications() }}
    </div>
    <div>{{ (resource as any).notificationSubscription.subscriptions }}</div>
    <div></div>
  </div>
</template>

<style scoped lang="css">
.controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  margin-bottom: 2rem;
}
</style>
