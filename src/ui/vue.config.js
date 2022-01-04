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
                onlyCompileBundledFiles: true,
                appendTsSuffixTo: ['\\.vue$'],
                compilerOptions: {
                    target: "esnext",
                    module: "esnext",
                    strict: false,
                    jsx:"preserve",
                    importHelpers: true,
                    moduleResolution: "node",
                    skipLibCheck: true,
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    noImplicitAny: false,
                    noImplicitThis: true,
                    lib: ['esnext', 'dom'],
                }
            });
    }
}
