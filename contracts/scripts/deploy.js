const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 開始部署合約...');

  const [deployer] = await ethers.getSigners();
  console.log(`📝 部署者地址: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 餘額: ${ethers.formatEther(balance)} ETH`);

  const HelloWorld = await ethers.getContractFactory('HelloWorld');
  const contract = await HelloWorld.deploy('Hello, Blockchain Game!');
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ HelloWorld 合約部署成功！`);
  console.log(`📄 合約地址: ${address}`);

  const msg = await contract.getMessage();
  console.log(`📨 合約訊息: ${msg}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});