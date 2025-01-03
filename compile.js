const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function compileCairo() {
    const contractsDir = path.join(__dirname, 'contracts');
    const compiledDir = path.join(__dirname, 'compiled');

    // Create compiled directory if it doesn't exist
    if (!fs.existsSync(compiledDir)) {
        fs.mkdirSync(compiledDir);
    }

    const contracts = ['PrivateNFT.cairo', 'PrivateMarketplace.cairo'];

    for (const contract of contracts) {
        console.log(`Compiling ${contract}...`);
        
        const inputPath = path.join(contractsDir, contract);
        const outputPath = path.join(compiledDir, contract.replace('.cairo', '.json'));

        const command = `starknet-compile-deprecated ${inputPath} --output ${outputPath} --abi ${outputPath.replace('.json', '_abi.json')}`;

        try {
            await new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error compiling ${contract}:`, error);
                        reject(error);
                        return;
                    }
                    if (stderr) {
                        console.error(`Stderr for ${contract}:`, stderr);
                    }
                    console.log(`${contract} compiled successfully!`);
                    console.log(stdout);
                    resolve();
                });
            });
        } catch (error) {
            console.error(`Failed to compile ${contract}`);
            process.exit(1);
        }
    }
}

// Run compilation
compileCairo().catch(console.error);
