const fs = require('fs-extra');
const path = require('path');
require('pkg-assets')

/**
 * Creates a new project with the provided project name.
 */
function createProject(projectName) {
    const projectPath = path.join(process.cwd(), projectName);
    const templatePath = path.join(__dirname, '/template');

    if (fs.existsSync(projectPath)) {
        console.error(`A project with the name ${projectName} already exists.`);
        return;
    }

    fs.copySync(templatePath, projectPath, {
        filter: (src, dest) => {
            const excludes = ['node_modules', 'dist', '*.lock', '.git', '.DS_Store'];
            return !excludes.some(dir => src.includes(dir));
        }
    });

    // Set the "name" in package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = projectName;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

    console.log(`Project ${projectName} has been created.`)
}

module.exports = {
    createProject,
}
