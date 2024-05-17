require('dotenv').config();

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { createProject } = require('./new');
const { deployContract } = require('./deploy');
const { runScript } = require('./run');

function spawnTask(command, args) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args);

        childProcess.stdout.on('data', (data) => {
            console.log(`Task running output: ${data}`);
        });

        childProcess.stderr.on('data', (data) => {
            console.error(`Task running error: ${data}`);
        });

        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(`Spawn task "${command + " " + args}" failed with exit code ${code}` + code);
            }
        });
    });
}

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
        if (script === undefined || script === null) {
            if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
                console.error('Please run this command from the project root');
                process.exit(1);
            }

            // Install dependencies and compile source code
            await spawnTask('npm', ['i']);
            await spawnTask('npm', ['run build']);

            const targetFilePath = path.join(process.cwd(), 'dist/index.js');
            if (!fs.existsSync(targetFilePath)) {
                console.error(`Couldn't find the target file under dist folder`);
                process.exit(1);
            }
            const script = fs.readFileSync(targetFilePath, 'utf8');

            // Upload target file and run in on remote engine
            executionResult = await runScript(uri, endpoint, contractId, script);
        } else if (script.includes('http')) {
            // TODO: execute remote Javascript code
        } else {
            // Execute the given Javascript code
            executionResult = await runScript(uri, endpoint, contractId, script);
        }
        console.log(`Execution result: ${JSON.stringify(executionResult, null, 2)}`);
    });
