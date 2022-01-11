// 暂时废弃这种方式，没有好的解决require配置文件的办法
const ShebangPlugin = require('webpack-shebang-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const Fs = require('fs')
const Path = require('path')

function getExternal () {
    let map = {};
    const nodeModules = Fs.readdirSync(Path.join(__dirname, 'node_modules'));
    nodeModules.forEach(module => {
        map[module] = true;
    })

    const { dependencies } = require('./package.json');
    for (let key in dependencies) {
        map[key] = true;
    }
    for (let key in map) {
        map[key] = `commonjs ${key}`;
    }
    return map;
}

module.exports = {
    mode: "development",
    devtool: false,
    target: 'node',
    entry: {
        file: ['./test/2.js', './test/1.js'],
    },
    output: {
        path: Path.join(__dirname, "./dist"),
        libraryTarget: "commonjs",
        // filename: (pathdata)=>{
        //     if (pathdata.chunk.name === 'index') {
        //         return '[name]/[name].js'
        //     }else{
        //         return '[name].js'
        //     }
        // }

    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.vue'],
        modules: [
            'node_modules'
        ]
    },
    plugins: [
        // new CleanWebpackPlugin({
        //     verbose: true,
        //     cleanStaleWebpackAssets: false,
        //     cleanOnceBeforeBuildPatterns: ['**/*'],
        // }),
    ]
}
