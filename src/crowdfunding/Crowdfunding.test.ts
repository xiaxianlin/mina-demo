import { AccountUpdate, fetchAccount, Field, Mina, PrivateKey, UInt64 } from 'o1js';
import { Crowdfunding } from './Crowdfunding';

let proofsEnabled = false;
const MINA = 1e9;
// 10s 后结束
const deadline = new UInt64(Date.now() + 10 * 1000);
// 募集目标
const target = Field(100);
describe('Crowdfunding Local Net', () => {
  let deployer: Mina.TestPublicKey,
    donator1: Mina.TestPublicKey,
    donator2: Mina.TestPublicKey,
    donator3: Mina.TestPublicKey,
    receiver: Mina.TestPublicKey,
    zkAppAccount: PrivateKey,
    zkApp: Crowdfunding;

  beforeAll(async () => {
    if (proofsEnabled) {
      await Crowdfunding.compile();
    }
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployer, donator1, donator2, donator3, receiver] = Local.testAccounts;

    zkAppAccount = PrivateKey.random();
    zkApp = new Crowdfunding(zkAppAccount.toPublicKey());
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployer.key, zkAppAccount]).send();
  }

  it('发起众筹', async () => {
    await localDeploy();
    const txn = await Mina.transaction(deployer, async () => {
      await zkApp.create(target, deadline);
    });
    await txn.prove();
    await txn.sign([deployer.key]).send();
    expect(zkApp.target.get()).toEqual(target);
    expect(zkApp.deadline.get()).toEqual(deadline);
  });

  it('测试捐款', async () => {
    await localDeploy();
    const txn = await Mina.transaction(donator1, async () => {
      await zkApp.donate(Field(10));
    });
    await txn.prove();
    await txn.sign([donator1.key]).send();
    expect(zkApp.raised.get()).toEqual(Field(10));
  });
});
