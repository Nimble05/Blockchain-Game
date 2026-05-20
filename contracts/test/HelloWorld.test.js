const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('HelloWorld', function () {
  let contract;
  let owner;
  let otherUser;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();

    const HelloWorld = await ethers.getContractFactory('HelloWorld');
    contract = await HelloWorld.deploy('Hello, World!');
  });

  it('應該正確設置初始訊息', async function () {
    expect(await contract.getMessage()).to.equal('Hello, World!');
  });

  it('應該正確記錄部署者為 owner', async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it('任何人都可以更新訊息', async function () {
    await contract.connect(otherUser).setMessage('新訊息');
    expect(await contract.getMessage()).to.equal('新訊息');
  });

  it('更新訊息時應該觸發事件', async function () {
    await expect(contract.setMessage('更新訊息'))
      .to.emit(contract, 'MessageUpdated')
      .withArgs('Hello, World!', '更新訊息', owner.address);
  });
});