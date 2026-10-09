<script setup lang="ts">
import { useSolidAuth } from "@ldo/solid-vue";

const solidAuth = useSolidAuth();

const login = async () => {
  const idp = prompt(
    "Please select your identity provider:",
    "https://solidcommunity.net",
  );

  try {
    if (!idp) throw new Error("No identity provider specified.");
    new URL(idp);
    console.log(
      "LOGIN",
      globalThis.location.origin + globalThis.location.pathname,
    );
    await solidAuth.login(
      idp,
      globalThis.location.origin + globalThis.location.pathname,
    );
  } catch (e) {
    console.error(e, "AUTH ERROR");
    const message = e instanceof Error ? e.message : "Unexpected Error";
    alert(`${message} Please specify a valid URL of your identity provider.`);
  }
};

async function logout() {
  await solidAuth.logout();
}

async function handleHistoryHome() {
  globalThis.history.pushState({}, document.title, globalThis.location.origin);
}
</script>

<template>
  <h2>Solid Auth</h2>
  <div v-if="solidAuth.session.value.isActive">
    {{ solidAuth.session.value.webId }}
  </div>

  <div v-if="!solidAuth.ranInitialAuthCheck.value">CHECKING AUTH</div>

  <button @click="logout" v-else-if="solidAuth.session.value.isActive">
    Sign out
  </button>
  <button @click="login" v-else="solidAuth.session.value.isActive">
    Sign in
  </button>

  <button @click="handleHistoryHome">history home</button>
</template>
