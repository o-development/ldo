<script setup lang="ts">
import { computed, ref } from "vue";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes.js";
import { useResource, useMatchSubject } from "./ldoVue.js";

const isValidUrl = (str: string) => {
  try {
    return Boolean(new URL(str));
  } catch {
    return false;
  }
};

const resource = ref("https://timbl.solidcommunity.net/profile/card");
const predicateInput = ref("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
const objectInput = ref("http://xmlns.com/foaf/0.1/Person");
const graphInput = ref("");

const predicate = computed(() => predicateInput.value || undefined);
const object = computed(() => objectInput.value || undefined);
const graph = computed(() => graphInput.value || resource.value);

const validResource = computed(() =>
  isValidUrl(resource.value) ? resource.value : "",
);

const subjectsSet = useMatchSubject(
  FoafProfileShapeType,
  predicate,
  object,
  graph,
);

const subjects = computed(() => {
  return subjectsSet.value.toArray();
});

useResource(validResource);
</script>

<template>
  <div>
    <h1>useMatchSubject test</h1>

    <input v-model="resource" placeholder="resource" />
    <br />
    <input v-model="predicateInput" placeholder="predicate" />
    <br />
    <input v-model="objectInput" placeholder="object" />
    <br />
    <input v-model="graphInput" placeholder="graph" />
    <br />

    <ul>
      <li v-for="item in subjects">
        {{ item.knows?.map((p) => p["@id"]).join(", ") }}
      </li>
    </ul>
  </div>
</template>
