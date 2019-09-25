/*
 * @author David Menger
 */
'use strict';

const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const config = require('../config');
const webpackConfig = require('../webpack.config');
const lambdaTester = require('../lib/lambdaTester');

const distPath = path.join(__dirname, '..', 'dist');

const app = express();

if (config.environment === 'development') {
    // @ts-ignore
    const compiler = webpack(Object.assign(webpackConfig, {
        devtool: 'cheap-module-eval-source-map'
    }));

    app.use(webpackDevMiddleware(compiler, {
        publicPath: '/',
        stats: 'minimal'
    }));
}

app.use('/', express.static(distPath));

const cfgFile = path.join(__dirname, '..', 'serverless.yml');

const api = lambdaTester.yamlParser(cfgFile);

Object.assign(config, {
    development: true
});

app.use('/api', bodyParser.text({ type: () => true }), api);

const server = http.createServer(app);

server.listen(3000, () => {
    console.log('Example app listening on port 3000!'); // eslint-disable-line
});
