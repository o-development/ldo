# @ldo/vue

`@ldo/vue` provides composables for easily building Linked Data applications using [Vue](https://vuejs.org).

**Note:** If you're building a [Solid](https://solidproject.org) application with Vue, we recommend that you use [@ldo/solid-vue](https://www.npmjs.com/package/@ldo/solid-vue) instead of this package.

## Installation

If you haven't already, [create your Vue project](https://vuejs.org/guide/quick-start.html#creating-a-vue-application).

Navigate into your project's root folder and run the following command:

```sh
cd my_project
npx @ldo/cli init
```

Now install the `@ldo/vue` library:

```sh
npm i @ldo/vue
```

Also install a connected plugin of your choice:

```sh
npm i @ldo/connected-solid @ldo/connected-nextgraph
```

<details>
<summary>
Manual Installation
</summary>

If you already have generated ShapeTypes, you may install the `@ldo/ldo` and `@ldo/vue` libraries independently.

```sh
npm i @ldo/ldo @ldo/vue
```

Also install the connected plugin of your choice:

```sh
npm i @ldo/connected-solid @ldo/connected-nextgraph
```

</details>

## Simple Example

Below is a simple example of @ldo/vue in a real use-case. Assume that a ShapeType was previously generated and placed at `./_ldo/foafProfile.shapeTypes.ts`.

```ts
// src/ldo.ts

import { createLdoVueMethods } from "@ldo/vue";
// replace the plugin with the connected plugin(s) of your choice
import { solidConnectedPlugin } from "@ldo/connected-solid";

// create LDO Vue methods that will be used in the whole app
export const {
  dataset,
  useSubject,
  useResource,
  useMatchSubject,
  useSubscribeToResource,
  /* export all you need */
} = createLdoVueMethods([solidConnectedPlugin]);

// At some point, you may want to implement some form of authentication
// suitable for your connected plugin.
// In case of Solid plugin, you need to provide authenticated fetch from the current session
dataset.setContext("solid", { fetch: authFetch });
// We recommend you just use @ldo/solid-vue instead
```

```vue
<script setup lang="ts">
import { ref } from "vue";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes.js";
import { useSubject, useResource } from "./ldo.js";

const personUri = ref<string>();
const subject = useSubject(FoafProfileShapeType, personUri);
const resource = useResource(personUri);
// TODO show how to use subscription to resources
</script>

<template>
  <input v-model="personUri" placeholder="Enter a webId" />
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
```

## API Details

Vue [composables](https://vuejs.org/guide/reusability/composables.html):

- [useLdo](https://ldo.js.org/latest/api/vue/useLdo/)
- [useResource](https://ldo.js.org/latest/api/vue/useResource/)
- [useSubject](https://ldo.js.org/latest/api/vue/useSubject/)
- [useMatchSubject](https://ldo.js.org/latest/api/vue/useMatchSubject/)
- [useMatchObject](https://ldo.js.org/latest/api/vue/useMatchObject/)
- [useSubscribeToResource](https://ldo.js.org/latest/api/vue/useSubscribeToResource/)
- [useLinkQuery](https://ldo.js.org/latest/api/vue/useLinkQuery/)
- [useChangeDataset](https://ldo.js.org/latest/api/vue/useChangeDataset/)
- [useChangeSubject](https://ldo.js.org/latest/api/vue/useChangeSubject/)
- [useChangeMatchSubject](https://ldo.js.org/latest/api/vue/useChangeMatchSubject/)
- [useChangeMatchObject](https://ldo.js.org/latest/api/vue/useChangeMatchObject/)

## Sponsorship

This project was made possible by a grant from [NGI0 Commons Fund](https://nlnet.nl/commonsfund/) via nlnet. Learn more on the [NLnet project page](https://nlnet.nl/project/LDO-up/).

[<img src="https://nlnet.nl/logo/banner.png" alt="nlnet foundation logo" width="300" />](https://nlnet.nl/)
[<img src="https://nlnet.nl/image/logos/NGI0CommonsFund_tag.svg" alt="NGI Zero Commons Logo" width="300" />](https://nlnet.nl/commonsfund/)

## License

MIT
