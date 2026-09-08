<script setup lang="ts">
import { computed, ref } from "vue";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes.ts";
import { useSubject, useResource } from "./ldoVue.ts";

const isValidUrl = (str: string) => {
  try {
    return Boolean(new URL(str));
  } catch {
    return false;
  }
};

const inputUri = ref("");

const validUri = computed(() =>
  isValidUrl(inputUri.value) ? inputUri.value : "",
);

const subject = useSubject(FoafProfileShapeType, inputUri);
console.log(subject);
useResource(validUri);
</script>

<template>
  <div>
    <h1>vue Solid auth test</h1>
    <input v-model="inputUri" placeholder="enter webId" />
    <div>{{ subject?.name ?? subject?.["@id"] }}</div>

    <p>checked:</p>
    <p>active:</p>
    <p>webId:</p>
    <p>webId resource:</p>

    <form>
      <input />
      <button type="submit">login</button>
    </form>

    <!-- <button type="button" @onClick="logout">logout</button> -->

    <form>
      <input />
      <button type="submit">fetch</button>
    </form>

    <pre></pre>
  </div>
</template>

<style scoped></style>
