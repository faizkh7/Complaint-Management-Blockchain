const fs = require("fs-extra");
const path = require("path");
const solc = require("solc");

const compile = () => {
    try {
    // build path where compiled contract will save
    const buildPath = path.resolve(__dirname,"./build");

    // remove the build folder if it exist
    fs.removeSync(buildPath);

    // path of the Smart Contract
    const contractPath = path.resolve(__dirname,"./contracts","ComplaintSystem.sol");
    
    // Read the Smart Contract
    const source = fs.readFileSync(contractPath, "utf8");

    // Compile the smart contract
    const contract = JSON.stringify({
        language: "Solidity",
        sources: {
            "ComplaintSystem.sol": {
                content: source
            }
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["*"]
                }
            }
        }
    });

    const output = JSON.parse(solc.compile(contract));
    console.log("output:", output);

    const contractOutput = output.contracts["ComplaintSystem.sol"]["ComplaintSystem"];
    
    // Create the build folder if it not exist 
    fs.ensureDirSync(buildPath);
    
    // Save the output in json format
    fs.outputJSONSync(path.resolve(buildPath, "ComplaintSystem"+".json"), contractOutput);

    return "Contract compiled successfully!"
    } catch (error) {
        console.error(error);
        return error;
    }
};

compile();

module.exports = compile;