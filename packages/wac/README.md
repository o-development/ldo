# @ldo/wac

Web Access Control plugin for @ldo/connected-solid

## Usage

```ts
const extendedPlugin = solidConnectedPlugin.extendResource(
  wacCapability,
  "wac",
);
const connectedLdoDataset = createConnectedLdoDataset([extendedPlugin]);

const resource = connectedLdoDataset.getResource(
  "https://example.com/profile/card",
);

resource.wac.getWac();

const parent = resource.getParentContainer();

parent.wac.setWac();
```
