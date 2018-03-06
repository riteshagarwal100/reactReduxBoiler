var fs = require('fs')
var path = require('path')
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {

    entry: path.resolve(__dirname, 'server', 'server.js'),
    output: {
        path: __dirname + "/dist",
        filename: 'server.bundle.js',
        libraryTarget: "commonjs2",
        publicPath: '/',
    },
    target: 'node',
    externals: fs.readdirSync(path.resolve(__dirname, 'node_modules')).concat([
        'react-dom/server', 'react/addons',
    ]).reduce(function (ext, mod) {
        ext[mod] = 'commonjs ' + mod
        return ext
    }, {}),
    node: {
        __filename: true,
        __dirname: true
    },
    resolve: {
        extensions: ["", ".web.js", ".js", ".jsx", ".ts", ".tsx"]
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?module!postcss-loader')
            },
            {
                test: /\.less$/,
                loader: "isomorphic-style-loader!style!css!less?strictMath&noIeCompat"
            },
            {test: /\.json$/, loader: 'json-loader'},
            {test: /\.(ico|png|jpg|gif)(\?.+)?$/, loader: 'url?limit=50000'},
            {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'},
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                loader: 'babel-loader?presets[]=stage-0&presets[]=es2015&presets[]=react!ts-loader?compiler=byots&jsx=true'
            },
             { test: require.resolve("jquery"), loader: "imports?jQuery=jquery" }
        ]
    },
     plugins:   [
        new webpack.DefinePlugin({
            'NODE_ENV': '"development"'
            }),
         new webpack.ProvidePlugin({
           $: "jquery",
           jQuery: "jquery"
       })    
    ]
}