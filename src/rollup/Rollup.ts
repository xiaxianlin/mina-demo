import { DeployArgs, Field, MerkleMapWitness, SmartContract, State, state, Struct } from 'o1js';

class RollupState extends Struct({ initialRoot: Field, latestRoot: Field }) {
  static createOneStep(
    initialRoot: Field,
    latestRoot: Field,
    key: Field,
    currentValue: Field,
    incrementAmount: Field,
    merkleMapWitness: MerkleMapWitness
  ) {
    const [witnessRootBefore, witnessKey] = merkleMapWitness.computeRootAndKey(currentValue);
    initialRoot.assertEquals(witnessRootBefore);

    witnessKey.assertEquals(key);

    const [witnessRootAfter] = merkleMapWitness.computeRootAndKey(currentValue.add(incrementAmount));

    latestRoot.assertEquals(witnessRootAfter);

    return new RollupState({
      initialRoot,
      latestRoot,
    });
  }
}

class RollupContract extends SmartContract {
  @state(Field)
  state = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
  }
}
