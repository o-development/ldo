/* eslint-disable @typescript-eslint/no-explicit-any */
import { createUseLdo } from "./methods/useLdo";
import {
  createConnectedLdoDataset,
  type ConnectedPlugin,
} from "@ldo/connected";
import { createUseMatchObject } from "./methods/useMatchObject";
import { createUseMatchSubject } from "./methods/useMatchSubject";
import { createUseResource } from "./methods/useResource";
import { createUseSubject } from "./methods/useSubject";
import { createUseSubscribeToResource } from "./methods/useSubscribeToResource";

/**
 * A function that creates all common react functions given specific plugin.
 *
 * @example
 * `methods.ts`
 * ```tyepscript
 * import { solidConnectedPlugin } from "@ldo/connected-solid";
 * import { nextGraphConnectedPlugin } from "@ldo/connected-nextgraph";
 * import { createLdoReactMethods } from "@ldo/react";
 *
 * // Export the results to be used in the reset of the application
 * export const {
 *  dataset,
 *  useLdo,
 *  useMatchObject,
 *  useMatchSubject,
 *  useResource,
 *  useSubject,
 *  useSubscribeToResource,
 * } = createLdoReactMethods([
 *   solidConnectedPlugin,
 *   nextGraphConnectedPlugin
 * ]);
 * ```
 *
 * `App.tsx`
 * ```typescript
 * import react, { FunctionComponent } from "react";
 * import { PostShShapeType } from "./.ldo/posts.shapeType.ts";
 * import { useResource, useSubject } from "./methods.ts";
 *
 * const UseSubjectTest: FunctionComponent = () => {
 *   const resource = useResource(SAMPLE_DATA_URI);
 *   const post = useSubject(PostShShapeType, `${SAMPLE_DATA_URI}#Post1`);
 *   if (resource.isLoading() || !post) return <p>loading</p>;
 *
 *   return (
 *     <ul>
 *       {post.publisher.map((publisher) => {
 *         return <li key={publisher["@id"]}>{publisher["@id"]}</li>;
 *       })}
 *     </ul>
 *   );
 * };
 * ```
 */
export function createLdoReactMethods<
  Plugins extends ConnectedPlugin<any, any, any, any>[],
>(plugins: Plugins) {
  const dataset = createConnectedLdoDataset(plugins);
  dataset.setMaxListeners(1000);

  return {
    dataset,
    useLdo: createUseLdo(dataset),
    useMatchObject: createUseMatchObject(dataset),
    useMatchSubject: createUseMatchSubject(dataset),
    useResource: createUseResource(dataset),
    useSubject: createUseSubject(dataset),
    useSubscribeToResource: createUseSubscribeToResource(dataset),
  };
}
