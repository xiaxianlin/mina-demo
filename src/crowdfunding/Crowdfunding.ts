import { Field, SmartContract, Permissions, state, State, method, DeployArgs, UInt64 } from 'o1js';

export class Crowdfunding extends SmartContract {
  /** 目标金额 */
  @state(Field) target = State<Field>(Field(0));
  /** 已筹集金额 */
  @state(Field) raised = State<Field>(Field(0));
  /** 结束时间 */
  @state(UInt64) deadline = State<UInt64>(new UInt64(0));

  deploy(args?: DeployArgs) {
    this.account.permissions.set({ ...Permissions.default(), editState: Permissions.proofOrSignature() });
    return super.deploy(args);
  }

  /** 发起众筹 */
  @method async create(amount: Field, deadline: UInt64) {
    this.target.getAndRequireEquals();
    this.deadline.getAndRequireEquals();
    this.target.set(amount);
    this.deadline.set(deadline);
  }

  @method async donate(amount: Field) {
    const raised = this.raised.getAndRequireEquals();

    this.raised.set(raised.add(amount));
  }
}
