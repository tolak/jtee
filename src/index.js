require('dotenv').config();

const { program } = require('commander');
const fs = require('fs');
const { createProject } = require('./new');
const { deployContract } = require('./deploy');

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
    const contractId = await deployContract(uri, process.env.PHALA_RPC);
    fs.writeFileSync('.contract', contractId, 'utf8');
});

const runScript = program
.command('run')
.description('Run given javascript on Phala TEE cloud.')
.argument('<string>', 'script to run')
.action(script => {
    eval(script)
});

program.parse();
