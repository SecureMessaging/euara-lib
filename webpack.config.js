var CopyWebpackPlugin = require('copy-webpack-plugin');
var DtsBundlerPlugin = require('dtsbundler-webpack-plugin');
var path = require('path');

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "./dist/index.js"
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        preLoaders: [
            { test: /\.json$/, loader: 'json-loader'},
        ],
        loaders: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    target: 'electron',

    plugins: [
         new CopyWebpackPlugin([
            { from: './src/package.json', to: './dist/package.json' },
            { from: './src/typings.d', to: './dist/index.d.ts' }
         ])
    ]
}