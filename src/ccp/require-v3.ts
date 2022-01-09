const Path = require('path')
const URL = require('url')


export function urlToFsPath(urlPath: string) {
    const result = URL.parse(urlPath)
    // @ts-ignore
    const projectPath = Editor.Project.path;

    let r1 = result.pathname
        ? Path.join(result.hostname, result.pathname)
        : Path.join(result.hostname);
    if (result.protocol === 'packages:') {
        return Path.join(projectPath, 'extensions', r1)
    } else if (result.protocol === 'db:') {
        return Path.join(projectPath, r1)
    }
    return null;
}

export function relativeUrlPath(urlPath: string) {
    const fsPath = urlToFsPath(urlPath);
    return Path.relative(__dirname, fsPath);
}

export function requireWithUrl(urlPath: string) {
    const fsPath = urlToFsPath(urlPath);
    if (fsPath) {
        return eval('require(`${fsPath}`)')
        // return require(fsPath)
    }
    return null;
}
