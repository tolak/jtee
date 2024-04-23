require('dotenv').config();

const { program } = require('commander');
const fs = require('fs');
const { createProject } = require('./new');
const { deployContract } = require('./deploy');
const { runScript } = require('./run');

program
    .option('--chain <chain>', 'Chain name that the script deploy on', 'phala')

const newProject = program
    .command('new')
    .description('Create a new jtee project.')
    .argument('<string>', 'Name of the new project')
    .action(projectName => {
        createProject(projectName);
    });

const deployEngine = program
    .command('deploy')
    .description('Deploy engine contract to Phala network.')
    .action(async () => {
        const uri = process.env.PHALA_ACCOUNT_URI;
        if (uri === null) {
            return new Error('Missing Account URI');
        }
        const endpoint = process.env.PHALA_RPC;
        if (endpoint === null) {
            return new Error('Missing RPC endpoint');
        }
        const contractId = await deployContract(uri, endpoint);
        fs.writeFileSync('.contract', contractId, 'utf8');
    });

const executeScript = program
    .command('run')
    .description('Run given javascript on Phala TEE cloud.')
    .argument('[script]', 'Javascript code to run')
    .action(async script => {
        const uri = process.env.PHALA_ACCOUNT_URI;
        if (uri === null) {
            return new Error('Missing Account URI');
        }
        const endpoint = process.env.PHALA_RPC;
        if (endpoint === null) {
            return new Error('Missing RPC endpoint');
        }
        const contractIdFile = '.contract'
        if (!fs.existsSync(contractIdFile)) {
            return new Error(`${contractIdFile} not exists.`);
        }
        const contractId = fs.readFileSync(contractIdFile, 'utf-8');

        let executionResult;
        if (script === 'undefined') {
            // Compile and execute current project located in ./dist/index.js
        } else if (script.includes('http')) {
            // TODO: execute remote Javascript code
        } else {
            // Execute the given Javascript code
            executionResult = await runScript(uri, endpoint, contractId, script);
        }
        console.log(`Execution result: ${JSON.stringify(executionResult, null, 2)}`);
    });

program.parse();
