/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ApplyTransformerReturnTypesDefaults,
  InterfaceReturnType,
  InterfaceTraverserDefinition,
  InterfaceType,
  KeyTypes,
  PrimitiveReturnType,
  PrimitiveType,
  TransformerInputReturnTypes,
  TraverserDefinitions,
  TraverserTypes,
  UnionReturnType,
  UnionType,
} from ".";
import { transformerParentSubTraverser } from "./transformerSubTraversers/TransformerParentSubTraverser";
import { CircularDepenedencyAwaiter } from "./transformerSubTraversers/util/CircularDependencyAwaiter";
import { MultiMap } from "./transformerSubTraversers/util/MultiMap";
import { SuperPromise } from "./transformerSubTraversers/util/SuperPromise";
import type {
  GetTransformedChildrenFunction,
  InterfaceTransformerDefinition,
  InterfaceTransformerInputDefinition,
  PrimitiveTransformerDefinition,
  PrimitiveTransformerInputDefinition,
  Transformers,
  TransformersInput,
  UnionTransformerDefinition,
  UnionTransformerInputDefinition,
} from "./Transformers";

// TODO: Lots of "any" in this file. I'm just done with fancy typescript,
// but if I ever feel so inclined, I should fix this in the future.

export class Transformer<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Types extends TraverserTypes<any>,
  InputReturnTypes extends TransformerInputReturnTypes<Types>,
  Context = undefined,
> {
  private traverserDefinition: TraverserDefinitions<Types>;
  private transformers: Transformers<
    Types,
    ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
    Context
  >;

  constructor(
    traverserDefinition: TraverserDefinitions<Types>,
    transformers: TransformersInput<Types, InputReturnTypes, Context>,
  ) {
    this.traverserDefinition = traverserDefinition;
    this.transformers = this.applyDefaultTransformers(transformers);
  }

  private applyDefaultInterfaceTransformerProperties<
    Type extends InterfaceType<keyof Types>,
    ReturnType extends InterfaceReturnType<Type>,
  >(
    typeName: keyof Types,
    typePropertiesInput: InterfaceTransformerInputDefinition<
      Types,
      Type,
      ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
      ReturnType,
      Context
    >["properties"],
  ): InterfaceTransformerDefinition<
    Types,
    Type,
    ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
    ReturnType,
    Context
  >["properties"] {
    return Object.keys(
      (this.traverserDefinition[typeName] as InterfaceTraverserDefinition<Type>)
        .properties,
    ).reduce<Record<KeyTypes, any>>((agg, key: keyof Type["properties"]) => {
      if (typePropertiesInput && typePropertiesInput[key]) {
        agg[key] = typePropertiesInput[key];
      } else {
        agg[key] = (
          originalData: any,
          getTransformedChildren: GetTransformedChildrenFunction<any>,
        ) => {
          return getTransformedChildren();
        };
      }
      return agg;
    }, {}) as InterfaceTransformerDefinition<
      Types,
      Type,
      ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
      ReturnType,
      Context
    >["properties"];
  }

  private applyDefaultInterfaceTransformer<
    Type extends InterfaceType<keyof Types>,
    ReturnType extends InterfaceReturnType<Type>,
  >(
    typeName: keyof Types,
    typeInput?: InterfaceTransformerInputDefinition<
      Types,
      Type,
      ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
      ReturnType,
      Context
    >,
  ): InterfaceTransformerDefinition<
    Types,
    Type,
    ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
    ReturnType,
    Context
  > {
    if (!typeInput) {
      return {
        transformer: async (
          originalData,
          getTransformedChildren: GetTransformedChildrenFunction<any>,
        ) => {
          return getTransformedChildren();
        },
        properties: this.applyDefaultInterfaceTransformerProperties(
          typeName,
          {},
        ),
      };
    }
    return {
      transformer: typeInput.transformer,
      properties: this.applyDefaultInterfaceTransformerProperties(
        typeName,
        typeInput.properties,
      ),
    };
  }

  private applyDefaultUnionTransformer<
    Type extends UnionType<keyof Types>,
    ReturnType extends UnionReturnType,
  >(
    typeInput?: UnionTransformerInputDefinition<
      Types,
      Type,
      ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
      ReturnType,
      Context
    >,
  ): UnionTransformerDefinition<
    Types,
    Type,
    ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
    ReturnType,
    Context
  > {
    if (!typeInput) {
      return async (
        originalData,
        getTransformedChildren: GetTransformedChildrenFunction<any>,
      ) => {
        return getTransformedChildren();
      };
    }
    return typeInput;
  }

  private applyDefaultPrimitiveTransformer<
    Type extends PrimitiveType,
    ReturnType extends PrimitiveReturnType,
  >(
    typeInput?: PrimitiveTransformerInputDefinition<Type, ReturnType, Context>,
  ): PrimitiveTransformerDefinition<Type, ReturnType, Context> {
    if (!typeInput) {
      return async (originalData) => {
        return originalData;
      };
    }
    return typeInput;
  }

  private applyDefaultTransformers(
    inputTransformers: TransformersInput<Types, InputReturnTypes, Context>,
  ): Transformers<
    Types,
    ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
    Context
  > {
    const finalTansformers: Partial<
      Transformers<
        Types,
        ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
        Context
      >
    > = {};
    Object.keys(this.traverserDefinition).forEach((typeName: keyof Types) => {
      if (this.traverserDefinition[typeName].kind === "interface") {
        finalTansformers[typeName] = this.applyDefaultInterfaceTransformer(
          typeName,
          inputTransformers[typeName] as any,
        ) as any;
      } else if (this.traverserDefinition[typeName].kind === "union") {
        finalTansformers[typeName] = this.applyDefaultUnionTransformer(
          inputTransformers[typeName] as any,
        ) as any;
      } else if (this.traverserDefinition[typeName].kind === "primitive") {
        finalTansformers[typeName] = this.applyDefaultPrimitiveTransformer(
          inputTransformers[typeName] as any,
        ) as any;
      }
    });
    return finalTansformers as Transformers<
      Types,
      ApplyTransformerReturnTypesDefaults<Types, InputReturnTypes>,
      Context
    >;
  }

  public async transform<TypeName extends keyof Types>(
    item: Types[TypeName]["type"],
    itemTypeName: TypeName,
    context: Context,
  ): Promise<
    ApplyTransformerReturnTypesDefaults<
      Types,
      InputReturnTypes
    >[TypeName]["return"]
  > {
    const superPromise = new SuperPromise();
    const toReturn = await transformerParentSubTraverser(item, itemTypeName, {
      traverserDefinition: this.traverserDefinition,
      transformers: this.transformers,
      executingPromises: new MultiMap(),
      circularDependencyAwaiter: new CircularDepenedencyAwaiter(),
      superPromise,
      context,
    });
    await superPromise.wait();
    return toReturn;
  }
}
