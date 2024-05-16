const fs = require('fs-extra');
const path = require('path');

/**
 * Creates a new project with the provided project name.
 */
function createProject(projectName) {
    const projectPath = path.join(process.cwd(), projectName);
    const templatePath = path.join(__dirname, '/template');

    if (!fs.existsSync(templatePath)) {
        console.error(`${templatePath} couldn't be found on filesystem}`);
        return;
    }

    if (fs.existsSync(projectPath)) {
        console.error(`A project with the name ${projectName} already exists.`);
        return;
    }

    fs.ensureDirSync(projectPath);
    console.log(`Trying copy files from ${templatePath} to ${projectName}}`);
    try {
        fs.copySync(templatePath, projectPath, {
            filter: (src, dest) => {
                const excludes = ['node_modules', 'dist', '*.lock', '.git', '.DS_Store'];
                return !excludes.some(dir => src.includes(dir));
            }
        });
    } catch (err) {
        console.error(`An error occurred while copying files from ${templatePath} to ${projectPath}`);
        console.error(err);
    }

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
