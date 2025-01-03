const { Provider, Account, Contract } = require('starknet');
const path = require('path');
require('dotenv').config();

async function main() {
  // Initialize provider
  const provider = new Provider({
    sequencer: {
      baseUrl: 'https://alpha4.starknet.io',
      feederGatewayUrl: 'https://alpha4.starknet.io/feeder_gateway',
      gatewayUrl: 'https://alpha4.starknet.io/gateway'
    }
  });

  // Initialize deployer account
  const privateKey = process.env.STARKNET_PRIVATE_KEY;
  const account = new Account(provider, process.env.DEPLOYER_ADDRESS, privateKey);

  console.log('Deploying NFT contract...');
  const nftContract = await deployContract('PrivateNFT', ['Private NFT', 'PNFT'], account);
  console.log('NFT contract deployed at:', nftContract.address);

  console.log('Deploying Marketplace contract...');
  const marketplaceContract = await deployContract('PrivateMarketplace', [nftContract.address], account);
  console.log('Marketplace contract deployed at:', marketplaceContract.address);

  // Save contract addresses
  const fs = require('fs');
  const deploymentInfo = {
    network: 'alpha-goerli',
    nftContract: nftContract.address,
    marketplaceContract: marketplaceContract.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, 'deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('Deployment info saved to deployment.json');
}

async function deployContract(contractName, constructorArgs, account) {
  const compiledPath = path.join(__dirname, '..', 'compiled', `${contractName}.json`);
  const abiPath = path.join(__dirname, '..', 'compiled', `${contractName}_abi.json`);

  if (!fs.existsSync(compiledPath)) {
    throw new Error(`Compiled contract not found at ${compiledPath}. Please run compile.js first.`);
  }

  const compiledContract = require(compiledPath);
  const abi = require(abiPath);
  
  console.log(`Deploying ${contractName} with args:`, constructorArgs);
  
  const deployResponse = await account.deploy({
    classHash: compiledContract.class_hash,
    constructorCalldata: constructorArgs
  });

  console.log(`${contractName} deployment response:`, deployResponse);

  const contract = new Contract(
    abi,
    deployResponse.contract_address,
    account
  );

  return contract;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
