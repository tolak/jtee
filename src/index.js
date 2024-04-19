const { program } = require('commander');

const { createProject } = require('./new');

program
    .option('--chain <chain>', 'Chain name that the script deploy on', 'phala')

const newProject = program
.command('new')
.description('Create a new jtee project.')
.argument('<string>', 'Name of the new project')
.action(projectName => {
    createProject(projectName);
});

const runScript = program
.command('run')
.description('Run given javascript on Phala TEE cloud.')
.argument('<string>', 'script to run')
.action(script => {
    eval(script)
});

program.parse();
