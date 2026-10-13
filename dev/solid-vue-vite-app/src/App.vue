<script setup lang="ts">
import { provideSolidLdo } from "./ldo.js";
import { RouterView, RouterLink } from "vue-router";
import SolidAuth from "./UseSolidAuth.vue";

provideSolidLdo();
</script>

<template>
  <header class="header">
    <nav class="navigation">
      <RouterLink to="/">home</RouterLink>
      <RouterLink to="/resource">useResource</RouterLink>
      <RouterLink to="/solid-auth">useSolidAuth</RouterLink>
      <RouterLink to="/match-subject">useMatchSubject</RouterLink>
    </nav>

    <div class="auth">
      <SolidAuth />
    </div>
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
  justify-content: space-between;
  margin: 1rem;
}

.navigation,
.auth {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.navigation {
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
