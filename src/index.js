const { program } = require('commander');

program
    .option('--chain <chain>', 'Chain name that the script deploy on', 'phala')

const newProject = program
.command('new')
.description('Create a new jtee project.');

const runScript = program
.command('run')
.description('Run given javascript on Phala TEE cloud.')
.argument('<string>', 'script to run')
.action(script => {
    eval(script)
});

const publishScript = program
.command('publish')
.description('Publish project to Phala TEE cloud');

program.parse();
