<script setup lang="ts">
import { computed, ref } from "vue";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes.js";
import { useSubject, useResource } from "./ldo.js";
import { provideSolidAuth } from "@ldo/solid-vue";
import { RouterView, RouterLink } from "vue-router";
import { router } from "./router.js";

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

provideSolidAuth();
</script>

<template>
  <header class="header">
    <nav class="navigation">
      <RouterLink to="/">home</RouterLink>
      <RouterLink to="/solid-auth">useSolidAuth</RouterLink>
      <RouterLink to="/match-subject">useMatchSubject</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped lang="css">
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.navigation {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;

  a {
    text-decoration: none;
    color: purple;
    font-variant: small-caps;
    cursor: pointer;

    &.router-link-exact-active {
      color: green;
    }
  }
}
</style>
