# @ldo/react

`@ldo/react` provides tools and hooks for easily building [RDF](https://www.w3.org/RDF/) applications using [React](https://react.dev).

**Note:** If you're building a [Solid](https://solidproject.org) application with React, we recommend that you use [@ldo/solid-react](https://www.npmjs.com/package/@ldo/solid-react) instead of this package.

## Installation

Navigate into your project's root folder and run the following command:

```sh
cd my_project/
npx @ldo/cli init
```

Now install the @ldo/react library:

```sh
npm i @ldo/react
```

Also install a connected plugin of your choice:

```sh
npm i @ldo/connected-solid @ldo/connected-nextgraph
```

<details>
<summary>
Manual Installation
</summary>

If you already have generated ShapeTypes, you may install the `@ldo/ldo` and `@ldo/react` libraries independently.

```sh
npm i @ldo/ldo @ldo/react
```

Also install the connected plugin of your choice:

```sh
npm i @ldo/connected-solid @ldo/connected-nextgraph
```

</details>

## Simple Example

Below is a simple example of @ldo/react in a real use-case. Assume that a ShapeType was previously generated and placed at `./_ldo/foafProfile.shapeTypes.ts`.

```tsx
import { createLdoReactMethods } from "@ldo/react";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes";
import { solidConnectedPlugin, type SolidLeafUri } from "@ldo/connected-solid";
import { useCallback, useEffect, type FunctionComponent } from "react";

const { useLdo, useSubject, useResource, dataset } = createLdoReactMethods([
  solidConnectedPlugin,
]);

// At some point, you may want to implement some form of authentication
// suitable for your connected plugin,
// especially if you want to access non-public data.
// If you're building a Solid app, we strongly recommend @ldo/solid-react
// instead of this library.
// In this case, you need to get authenticated fetch from the current session
dataset.setContext("solid", { fetch: authFetch });

function App() {
  useEffect(() => {
    // If you use auth library, you will need to handle login redirect
  }, []);

  return <Login></Login>;
}

const Login: FunctionComponent = () => {
  const handleLogin = useCallback(async () => {
    const issuer = prompt("What is your Solid IDP?");
    // Call the "login" function to initiate login
    if (issuer) {
      // You will need to handle login depending on your auth library of choice
    }
  }, []);

  const handleLogout = useCallback(async () => {
    // You will need to handle logout depending on your auth library of choice
  }, []);

  /**
   * You will need to replace the following with the API of your auth library
   */
  const webId = authLibrarySession.webId;
  const isSignedIn = authLibrarySession.isSignedIn;

  if (isSignedIn) {
    return (
      <div>
        {/* Get the user's webId */}
        <p>Logged in as {webId}</p>
        {/* Use the logout function to log out */}
        <button onClick={handleLogout}>Log Out</button>
        <Profile webId={webId} />
      </div>
    );
  }
  return <button onClick={handleLogin}>Log In</button>;
};

// Renders the name on the profile
const Profile: FunctionComponent<{ webId: SolidLeafUri }> = ({ webId }) => {
  const { changeData, commitData } = useLdo();
  // With useResource, you can automatically fetch a resource
  const resource = useResource(webId);
  // With useSubject, you can extract data from that resource
  const profile = useSubject(FoafProfileShapeType, webId);

  const onNameChange = useCallback(
    async (e) => {
      // Ensure that the profile and resource exist
      if (!profile || !resource) return;
      // Change data lets you create a new object to make changes to
      const cProfile = changeData(profile, resource);
      console.log("changed data");
      // Change the name
      cProfile.name = e.target.value;
      // Commit the data back to the Pod
      const result = await commitData(cProfile);

      console.log(result.isError);
      if (!result.isError && result.type === "aggregateSuccess")
        console.log(result.results);
    },
    [changeData, commitData, profile, resource],
  );

  return <input type="text" value={profile?.name} onChange={onNameChange} />;
};

export default App;
```

## API Details

Hooks

- [useLdo](https://ldo.js.org/latest/api/react/useLdo/)
- [useResource](https://ldo.js.org/latest/api/react/useResource/)
- [useSubject](https://ldo.js.org/latest/api/react/useSubject/)
- [useMatchSubject](https://ldo.js.org/latest/api/react/useMatchSubject/)
- [useMatchObject](https://ldo.js.org/latest/api/react/useMatchObject/)
- [useSubscribeToResource](https://ldo.js.org/latest/api/react/useSubscribeToResource/)
- [useLinkQuery](https://ldo.js.org/latest/api/react/useLinkQuery/)
- [useChangeSubject](https://ldo.js.org/latest/api/react/useChangeSubject/)
- [useChangeMatchSubject](https://ldo.js.org/latest/api/react/useChangeMatchSubject/)
- [useChangeMatchObject](https://ldo.js.org/latest/api/react/useChangeMatchObject/)
- [useChangeDataset](https://ldo.js.org/latest/api/react/useChangeDataset/)

## Sponsorship

This project was made possible by a grant from NGI Zero Entrust via nlnet. Learn more on the [NLnet project page](https://nlnet.nl/project/SolidUsableApps/).

[<img src="https://nlnet.nl/logo/banner.png" alt="nlnet foundation logo" width="300" />](https://nlnet.nl/)
[<img src="https://nlnet.nl/image/logos/NGI0Entrust_tag.svg" alt="NGI Zero Entrust Logo" width="300" />](https://nlnet.nl/)

## License

MIT
