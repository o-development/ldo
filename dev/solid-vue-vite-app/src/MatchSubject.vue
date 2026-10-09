<script setup lang="ts">
import { computed, ref } from "vue";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes.js";
import { useResource, useMatchSubject } from "./ldo.js";

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
const graph = computed(() => graphInput.value || undefined); //|| resource.value);

const validResource = computed(() =>
  isValidUrl(resource.value) ? resource.value : "",
);

const subjectsSet = useMatchSubject(
  FoafProfileShapeType,
  predicate,
  object,
  graph,
);

useResource(validResource);
</script>

<template>
  <div>
    <h2>useMatchSubject</h2>
    <div>
      <label for="resource">load resource: </label>
      <input id="resource" v-model="resource" placeholder="resource" />
    </div>

    <br />

    <div>
      <input v-model="predicateInput" placeholder="predicate" />
      <br />
      <input v-model="objectInput" placeholder="object" />
      <br />
      <input v-model="graphInput" placeholder="graph" />
    </div>

    <ul>
      <li v-for="item in subjectsSet">
        {{ item.name ?? item["@id"] }}:
        <ul>
          <li v-for="friend in item.knows">
            {{ friend.name ?? friend["@id"] }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
