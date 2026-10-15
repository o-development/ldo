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

Run `provideSolidLdo()` in your parent Vue component. It provides a dataset and auth session to `@ldo/solid-vue` composables in child components.

```vue
// App.vue
<script setup lang="ts">
import { provideSolidLdo } from "@ldo/solid-vue";
provideSolidLdo();
</script>

<template></template>
```

TODO

## API Details

TODO

## Caveats with `vue-router`

If you're using `vue-router` with `createWebHashHistory` and you authenticate with `useSolidAuth` and `login`, the hash part of the redirect URI will be lost.

## API Details

Solid + Vue [composables](https://vuejs.org/guide/reusability/composables.html):

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
