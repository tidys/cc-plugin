const path = require('path')
module.exports = {
    pages: {
        index: {
            entry: path.resolve(__dirname, 'main.ts'),
            template: path.resolve(__dirname, 'index.html'),
            filename: 'index.html'
        }
    },
    chainWebpack: config => {
        config.resolve.extensions.add('.json').add('.vue').add('.js').add('.ts');
        config.module
            .rule('ts')
            .test(/\.ts(x?)$/)
            .exclude.add(/node_modules/).end()
            .use('ts-loader')
            .loader('ts-loader')
            .options({
                // happyPackMode: true,
                transpileOnly: true,
                onlyCompileBundledFiles: true,
                appendTsSuffixTo: ['\\.vue$'],
                compilerOptions: {
                    target: "es6",
                    module: "es6",
                    strict: false,
                    // jsx: "preserve",
                    // importHelpers: true,
                    moduleResolution: "node",
                    skipLibCheck: true,
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    noImplicitAny: false,
                    // noImplicitThis: false,
                    lib: ['es6', 'dom'],
                }
            });
    }
}
