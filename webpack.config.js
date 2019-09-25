'use strict';
/* eslint import/no-extraneous-dependencies: 0 */

const path = require('path');
// const webpack = require('webpack');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: './public/main'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js?v=[chunkhash]',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.s[ca]ss$/,
                // fallback: 'style-loader',
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.css$/,
                // fallback: 'style-loader',
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.jsx?$/,
                // exclude just isomorph libraries
                exclude: /node_modules(\\|\/)(?!(prg-editor)(\\|\/)).*/i,
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-react',
                        [
                            '@babel/preset-env',
                            {
                                useBuiltIns: 'entry',
                                targets: {
                                    browsers: ['> 1%', 'last 3 versions', 'ie >= 10']
                                }
                            }
                        ]
                    ],
                    plugins: ['@babel/plugin-syntax-dynamic-import'],
                    cacheDirectory: true
                }
            },
            /* {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader',
                query: {
                    name: 'font/[name].[ext]',
                    publicPath: '/'
                }
            }, */
            {
                test: /\.(woff2?|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'base64-font-loader'
            },
            {
                test: /\.locale.yaml$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'locales/[path][name].json'
                        }
                    },
                    {
                        loader: 'yaml-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        // new CopyWebpackPlugin([
        //     {
        //         from: 'node_modules/monaco-editor/min/vs',
        //         to: 'vs'
        //     }
        // ]),
        // new MiniCssExtractPlugin({
        //     filename: 'styles/[name].css'
        // })
    ]
};
