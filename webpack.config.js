'use strict';
const webpack = require('webpack');
const path = require('path');





const NODE_ENV = process.env.NODE_ENV ? JSON.stringify(process.env.NODE_ENV.toLowerCase()) : JSON.stringify('development');

module.exports = {

    entry: {
        index: path.join(__dirname, 'client/index.tsx'),
        vendor: [
            'jquery',
            'axios',
            'moment',
            'history',
            'classnames',
            'js-cookie',
            'react',
            'react-redux',
            'react-bootstrap',
            'bootstrap-webpack',
            'react-router',
            'redux-batched-actions',
            'redux',
            'redux-thunk',
            'redux-form',
            'react-router-redux'
        ]
    },

    output: {
        filename: 'bundle.js',
        publicPath: '/',
        path: __dirname + '/public'
    },
    devtool: NODE_ENV == 'production' ? 'cheap-module-source-map' : '#inline-source-map',
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"]
            },
            { test: /\.html$/, loader: 'html-loader' },
            {test: /\.css$/, loader: 'style!css'},
            {
                test: /\.less$/,
                loader: "isomorphic-style-loader!style!css!less"
            },
            {test: /\.json$/, loader: 'json-loader'},
            {test: /\.(ico|png|jpg|gif)(\?.+)?$/, loader: 'url?limit=50000'},
            {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'},
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                loader: 'babel-loader?presets[]=stage-0&presets[]=es2015&presets[]=react!ts-loader?compiler=byots&jsx=true'
            },
            {test: require.resolve("jquery"), loader: "imports?jQuery=jquery"}

        ]

    },
    resolve: {
        extensions: ["", ".web.js", ".js", ".jsx", ".ts", ".tsx", ".json"]
    },
    plugins: NODE_ENV == 'production' ? [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': NODE_ENV
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 15}),
        new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.bundle.js',
            minChunks: Infinity
        })
    ] : [

        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': NODE_ENV
            }
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.bundle.js',
            minChunks: Infinity
        }),
        new webpack.NamedModulesPlugin()
    ]
}
