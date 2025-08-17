import type {
  ConnectedLdoTransactionDataset,
  ConnectedPlugin,
} from "@ldo/connected";
import type { LdoBase, LdSet } from "@ldo/ldo";

export type useChangeReturn<Type, Plugins extends ConnectedPlugin[]> = [
  Type,
  useChangeSetData<Type>,
  useChangeCommitData<Plugins>,
];

type BaseOtherType = LdoBase | LdSet<LdoBase>;

export type useChangeSetData<T> = <
  OtherType extends BaseOtherType | undefined = undefined,
>(
  changer: (toChange: OtherType extends undefined ? T : OtherType) => void,
  input?: OtherType,
) => void;

export type useChangeCommitData<Plugins extends ConnectedPlugin[]> =
  () => ReturnType<ConnectedLdoTransactionDataset<Plugins>["commitToRemote"]>;
