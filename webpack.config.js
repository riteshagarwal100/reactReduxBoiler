

'use strict';
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const path = require('path');
const precss = require('precss');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV ? JSON.stringify(process.env.NODE_ENV.toLowerCase()) : JSON.stringify('production');

module.exports = {

    entry: path.join(__dirname, 'client/index.tsx'),

    output: {
        filename: 'bundle.js',
        publicPath: '/',
        path: __dirname + '/public'
    },
    devtool: NODE_ENV == 'production' ? 'cheap-module-source-map' : '#inline-source-map',
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx",".json"]
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                loader: 'babel-loader?presets[]=stage-0&presets[]=es2015&presets[]=react!ts-loader?compiler=byots&jsx=true'

            },            
            {
              test: /\.(scss)|.css$/,
              use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                  }, {
                    loader: 'postcss-loader', // Run post css actions
                    options: {
                      plugins() {
                        // post css plugins, can be exported to postcss.config.js
                        return [
                          precss,
                          autoprefixer
                        ];
                      }
                    }
                  }, {
                    loader: 'sass-loader' // compiles SASS to CSS
                  }
                ]
              })
            },
            {
              test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              use: 'url-loader?limit=10000',
            },
            {
             test: /\.(ttf|eot)(\?[\s\S]+)?$/,
              // test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/, add font pasth with folder or file name. else svg sprite will not work               
              use: 'file-loader',
            },
            {
             test: /\.(jpe?g|png|svg|gif)$/i,
              use: [
                'file-loader?name=images/[name].[ext]',
                'image-webpack-loader?bypassOnDebug'
              ]
            },
            // font-awesome
            {
              test: /font-awesome\.config\.js/,
              use: [
                { loader: 'style-loader' },
                { loader: 'font-awesome-loader' }
              ]
            },
      
            // Bootstrap 4
            {
              test: /bootstrap\/dist\/js\/umd\//, use: 'imports-loader?jQuery=jquery'
            }
          ]

    },
    plugins: [

        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': NODE_ENV
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
		new webpack.optimize.UglifyJsPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new webpack.NamedModulesPlugin(),
        new ExtractTextPlugin('site.css'),
        new TransferWebpackPlugin([
            { from: 'client' },
          ])
    ]
}
