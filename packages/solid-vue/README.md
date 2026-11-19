# @ldo/solid-vue

`@ldo/solid-vue` provides composables for easily building [Solid](https://solidproject.org) applications using [Vue](https://vuejs.org).

**Note:** If you're building a generic RDF application with Vue, please use [@ldo/vue](https://www.npmjs.com/package/@ldo/vue) instead of this package.

## Guide

A full walkthrough for using the `@ldo/solid-vue` library can be found in the [For Solid + Vue Guide](https://ldo.js.org/latest/guides/solid_vue/).

## Installation

Navigate into your project's root folder and run the following command:

```sh
cd my_project/
npx @ldo/cli init
```

Now install the @ldo/solid-vue library

```sh
npm i @ldo/solid-vue
```

### Manual Installation

If you already have generated ShapeTypes, you may install the `@ldo/ldo` and `@ldo/solid-vue` libraries independently.

```sh
npm i @ldo/ldo @ldo/solid-vue
```

## Example

Run `provideSolidLdo()` in your root Vue component. It provides a dataset and auth session to be injected into the composables in the component tree.

```vue
<!-- App.vue -->
<script setup lang="ts">
// Run the provider in the root component
import { provideSolidLdo } from "@ldo/solid-vue";
provideSolidLdo();
</script>
```

```vue
<script setup lang="ts">
import { useSolidAuth, useResource, useSubject } from "@ldo/solid-vue";

const solidAuth = useSolidAuth();

const handleLogin = async () => {
  // idp is Solid identity provider to sign in with
  // redirectUri can be e.g. globalThis.location.href if app's client id allows
  await solidAuth.login(idp, redirectUri);
};

const handleLogout = async () => {
  await solidAuth.logout();
};

const webId = computed(() => solidAuth.session.value.webId);

// the arguments can usually be passed as a ref or constant
const resourceResult = useResource(webId, useResourceOptions);
const person = useSubject(FoafProfileShapeType, webId, useSubjectOptions);
</script>

<template>
  <div v-if="!solidAuth.ranInitialAuthCheck.value">Checking authentication</div>
  <button @click="handleLogout" v-else-if="solidAuth.session.value.isActive">
    Sign out
  </button>
  <button @click="handleLogin" v-else>Sign in</button>

  <div>{{ person.name }}</div>
</template>
```

### Additional plugins

To use other connected plugins in addition to Solid, create the composables with the `createBrowserSolidVueComposables` factory.

```ts
import { createBrowserSolidVueComposables } from "@ldo/solid-vue";
import { nextGraphConnectedPlugin } from "@ldo/connected-nextgraph";

export const {
  provideSolidLdo,
  useSubject,
  useResource,
  useMatchSubject,
  useSolidAuth,
  useRootContainerFor,
} = createBrowserSolidVueComposables([nextGraphConnectedPlugin]); // additional plugins here
```

If you don't want to use Solid, use `@ldo/vue` instead of this package.

## Caveats with `vue-router`

If you're using `vue-router` with `createWebHashHistory` and you authenticate with `useSolidAuth` and `login`, the hash part of the redirect URI and therefore your routing will be lost.

## API Details

Solid + Vue [composables](https://vuejs.org/guide/reusability/composables.html):

### Providers

- [provideSolidLdo](https://ldo.js.org/latest/api/solid-vue/provideSolidLdo/)

### Composables

Generic `@ldo/vue` composables with integrated Solid connected plugin:

- [useLdo](https://ldo.js.org/latest/api/solid-vue/useLdo/)
- [useResource](https://ldo.js.org/latest/api/solid-vue/useResource/)
- [useSubject](https://ldo.js.org/latest/api/solid-vue/useSubject/)
- [useMatchSubject](https://ldo.js.org/latest/api/solid-vue/useMatchSubject/)
- [useMatchObject](https://ldo.js.org/latest/api/solid-vue/useMatchObject/)
- [useSubscribeToResource](https://ldo.js.org/latest/api/solid-vue/useSubscribeToResource/)
- [useLinkQuery](https://ldo.js.org/latest/api/solid-vue/useLinkQuery/)
- [useChangeDataset](https://ldo.js.org/latest/api/solid-vue/useChangeDataset/)
- [useChangeSubject](https://ldo.js.org/latest/api/solid-vue/useChangeSubject/)
- [useChangeMatchSubject](https://ldo.js.org/latest/api/solid-vue/useChangeMatchSubject/)
- [useChangeMatchObject](https://ldo.js.org/latest/api/solid-vue/useChangeMatchObject/)

Solid-specific composables:

- [useSolidAuth](https://ldo.js.org/latest/api/solid-vue/useSolidAuth/)
- [useRootContainerFor](https://ldo.js.org/latest/api/solid-vue/useRootContainerFor/)

### Composable factory

- [createBrowserSolidVueComposables](https://ldo.js.org/latest/api/solid-vue/createBrowserSolidVueComposables/)

## Sponsorship

This project was made possible by a grant from [NGI0 Commons Fund](https://nlnet.nl/commonsfund/) via nlnet. Learn more on the [NLnet project page](https://nlnet.nl/project/LDO-up/).

[<img src="https://nlnet.nl/logo/banner.png" alt="nlnet foundation logo" width="300" />](https://nlnet.nl/)
[<img src="https://nlnet.nl/image/logos/NGI0CommonsFund_tag.svg" alt="NGI Zero Commons Logo" width="300" />](https://nlnet.nl/commonsfund/)

## License

MIT
