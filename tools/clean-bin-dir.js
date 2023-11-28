const Fs = require('fs');
const Path = require('path')
const FsExtra = require('fs-extra')
const binDir = Path.join(__dirname, 'bin');
if (Fs.existsSync(binDir)) {
    if (Fs.statSync(binDir).isDirectory()) {
        FsExtra.removeSync(binDir);
        console.log('clean bin dir')
    }
}
