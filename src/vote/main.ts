import { AccountUpdate, Field, Mina, PrivateKey } from 'o1js';
import { Vote } from './Vote.js';

const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
Mina.setActiveInstance(Local);
const [deployer, member1, member2, member3] = Local.testAccounts;

const app = PrivateKey.random();
const instance = new Vote(app.toPublicKey());

const summary = () => {
  const agreed = instance.agreedCount.get();
  const rejected = instance.rejectedCount.get();
  console.log('Total Tickets: ', agreed.add(rejected).toString());
  console.log('Agree Tickets: ', agreed.toString());
  console.log('Reject Tickets: ', rejected.toString());
};

const vote = async (
  name: string,
  member: Mina.TestPublicKey,
  pass: boolean
) => {
  console.log(`${name} start vote`);
  console.time(name);
  const tx1 = await Mina.transaction(member, async () => {
    if (pass) {
      await instance.agree();
    } else {
      await instance.reject();
    }
  });
  await tx1.prove();
  await tx1.sign([member.key]).send();
  summary();
  console.timeEnd(name);
};

console.log('start deploy');
console.time('>>> [Deploy] <<<');
const deployTx = await Mina.transaction(deployer, async () => {
  AccountUpdate.fundNewAccount(deployer);
  await instance.deploy();
});
await deployTx.prove();
await deployTx.sign([deployer.key, app]).send();

summary();
console.timeEnd('>>> [Deploy] <<<');

await vote('member1', member1, true);
await vote('member2', member2, true);
await vote('member3', member3, false);
