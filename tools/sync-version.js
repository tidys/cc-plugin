const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');


function doWork() {
    const templatePkgJson = join(__dirname, '../template/project/package.json');
    if (!existsSync(templatePkgJson)) {
        console.error(`not exist file: ${templatePkgJson}`);
        process.exit(-1);
    }
    const ccpPkgJson = join(__dirname, '../package.json');
    if (!existsSync(ccpPkgJson)) {
        console.error(`not exist file: ${ccpPkgJson}`)
        process.exit(-1);
    }
    const ccpPkgJsonData = JSON.parse(readFileSync(ccpPkgJson, 'utf-8'))
    const templatePkgJsonData = JSON.parse(readFileSync(templatePkgJson, 'utf-8'));
    const { devDependencies } = templatePkgJsonData;
    if (!devDependencies) {
        console.error(`未发现devDependencies字段`)
        process.exit(-1);
    }
    const ccPlugin = devDependencies['cc-plugin'];
    if (!ccPlugin) {
        console.error(`未发现devDependencies.cc-plugin字段`)
        process.exit(-1);
    }
    devDependencies['cc-plugin'] = ccpPkgJsonData['version'];
    writeFileSync(templatePkgJson, JSON.stringify(templatePkgJsonData, null, 2));
    console.log(`sync version success: ${templatePkgJson}`);
}
doWork();