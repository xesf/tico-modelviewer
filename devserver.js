'use strict';

require('@babel/register')({
    presets: ['@babel/preset-env', '@babel/preset-react']
})

const fs = require('fs');
const http = require('http');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const express = require('express');
const middleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');
const webpack = require('webpack');
const bodyParser = require('body-parser');
const Main = require('./main.jsx');

const app = express();

app.set('port', process.env.PORT || 9090);
app.set('host', process.env.HOST || '0.0.0.0');

app.use(bodyParser.json());
app.use(bodyParser.raw({
    limit: '2mb'
}));

app.post('/metadata', function (req, res) {
    const body = req.body;
    console.log(`Saving metadata, content=${JSON.stringify(body, null, 2)}`);
    let fileName;
    switch (body.type) {
        case 'models':
            fileName = './www/metadata/models.json';
            break;
    }
    if (fileName) {
        fs.readFile(fileName, 'utf8', (err, file) => {
            if (err) {
                console.error(err);
            } else {
                const content = JSON.parse(file);
                if (!(body.subType in content)) {
                    content[body.subType] = [];
                }
                content[body.subType][body.subIndex] = body.value;
                fs.writeFile(fileName, JSON.stringify(content, null, 2), () => {});
            }
        });
    }
    res.end();
});

app.post('/lut.dat', function(req, res) {
    fs.writeFile('./www/lut.dat', req.body, () => {
        console.log('Saved lut.dat');
        res.end();
    });
});

app.use('/', express.static('./www'));

const indexBody = renderToStaticMarkup(React.createElement(Main, {
    script: 'window.ga=function(){};\nwindow.isLocalServer=true;'
}));

app.get('/', (req, res) => {
    res.end(indexBody);
});

webpackConfig.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = webpack(webpackConfig);
app.use(middleware(compiler));

app.listen(app.get('port'), app.get('host'));
