<script setup lang="ts">
import { ref, watch } from "vue";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes.js";
import { useSubject, useResource } from "./ldo.js";

const personUri = ref<string>("");
const subject = useSubject(FoafProfileShapeType, personUri);
const resource = useResource(personUri);
// TODO show how to use subscription to resources

watch(resource, (resource) => {
  console.log(resource);
});
</script>

<template>
  <input v-model="personUri" placeholder="Enter a webId" />
  <div v-if="resource">
    type: {{ resource.type }}
    <br />
    isError: {{ resource.isError }}
    <br />
    isFetched: {{ resource.isFetched() }}
    <br />
    isLoading:
    {{ resource.isLoading() }}
  </div>
  <div>Name: {{ subject?.name }}</div>
  <div>
    Friends:
    <ul>
      <li v-for="friend in subject?.knows" :key="friend['@id']">
        {{ friend["@id"] }}
      </li>
    </ul>
  </div>
</template>
