# @ldo/solid-react

`@ldo/solid-react` provides tool and hooks for easily building [Solid](https://solidproject.org) applications using [React](https://react.dev).

**Note:** If you're building a generic RDF application with React, please use [@ldo/react](https://www.npmjs.com/package/@ldo/react) instead of this package.

## Guide

A full walkthrough for using the `@ldo/solid-react` library can be found in the [For Solid + React Guide](https://ldo.js.org/latest/guides/solid_react/).

## Installation

Navigate into your project's root folder and run the following command:

```sh
cd my_project/
npx @ldo/cli init
```

Now install the @ldo/solid-react library

```sh
npm i @ldo/solid-react
```

### Manual Installation

If you already have generated ShapeTypes, you may install the `@ldo/ldo` and `@ldo/solid-react` libraries independently.

```sh
npm i @ldo/ldo @ldo/solid-react
```

## Simple Example

Below is a simple example of @ldo/solid-react in a real use-case. Assume that a ShapeType was previously generated and placed at `./_ldo/foafProfile.shapeTypes.ts`.

```tsx
import { useCallback, type FunctionComponent } from "react";
import {
  BrowserSolidLdoProvider,
  useLdo,
  useResource,
  useSolidAuth,
  useSubject,
} from "@ldo/solid-react";
import type { SolidLeafUri } from "@ldo/connected-solid";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes.js";

// The base component for the app
const App: FunctionComponent = () => {
  return (
    /* The application should be surrounded with the BrowserSolidLdoProvider
    this will set up all the underlying infrastructure for the application */
    <BrowserSolidLdoProvider>
      <Login />
    </BrowserSolidLdoProvider>
  );
};

// A component that handles login
const Login: FunctionComponent = () => {
  // Get login information using the "useSolidAuth" hook
  const { login, logout, session } = useSolidAuth();

  const onLogin = useCallback(async () => {
    const issuer = prompt("What is your Solid IDP?");
    // Call the "login" function to initiate login
    if (issuer) await login(issuer, globalThis.location.href);
  }, [login]);

  // You can use session.isActive to check if the user is logged in
  if (session.isActive) {
    return (
      <div>
        {/* Get the user's webId from session.webId */}
        <p>Logged in as {session.webId}</p>
        {/* Use the logout function to log out */}
        <button onClick={logout}>Log Out</button>
        <Profile />
      </div>
    );
  }
  return <button onClick={onLogin}>Log In</button>;
};

// Renders the name on the profile
const Profile: FunctionComponent = () => {
  const { session } = useSolidAuth();
  const { changeData, commitData } = useLdo();
  // With useResource, you can automatically fetch a resource
  const resource = useResource(session.webId as SolidLeafUri);
  // With useSubject, you can extract data from that resource
  const profile = useSubject(FoafProfileShapeType, session.webId);

  const onNameChange = useCallback(
    async (e) => {
      // Ensure that the profile and resource exist
      if (!profile || !resource) return;
      // Change data lets you create a new object to make changes to
      const cProfile = changeData(profile, resource);
      // Change the name
      cProfile.name = e.target.value;
      // Commit the data back to the Pod
      await commitData(cProfile);
    },
    [changeData, commitData, profile, resource],
  );

  return <input type="text" value={profile?.name} onChange={onNameChange} />;
};

export default App;
```

## API Details

Providers

- [BrowserSolidLdoProvider](https://ldo.js.org/latest/api/solid-react/BrowserSolidLdoProvider/)
- [SolidLdoProvider](https://ldo.js.org/latest/api/solid-react/SolidLdoProvider/)

Hooks

- [useLdo](https://ldo.js.org/latest/api/solid-react/useLdo/)
- [useResource](https://ldo.js.org/latest/api/solid-react/useResource/)
- [useRootContainer](https://ldo.js.org/latest/api/solid-react/useRootContainer/)
- [useSolidAuth](https://ldo.js.org/latest/api/solid-react/useSolidAuth/)
- [useSubject](https://ldo.js.org/latest/api/solid-react/useSubject/)
- [useMatchSubject](https://ldo.js.org/latest/api/solid-react/useMatchSubject/)
- [useMatchObject](https://ldo.js.org/latest/api/solid-react/useMatchObject/)
- [useSubscribeToResource](https://ldo.js.org/latest/api/solid-react/useSubscribeToResource/)
- [useLinkQuery](https://ldo.js.org/latest/api/solid-react/useLinkQuery/)

## Sponsorship

This project was made possible by a grant from NGI Zero Entrust via nlnet. Learn more on the [NLnet project page](https://nlnet.nl/project/SolidUsableApps/).

[<img src="https://nlnet.nl/logo/banner.png" alt="nlnet foundation logo" width="300" />](https://nlnet.nl/)
[<img src="https://nlnet.nl/image/logos/NGI0Entrust_tag.svg" alt="NGI Zero Entrust Logo" width="300" />](https://nlnet.nl/)

## License

MIT
