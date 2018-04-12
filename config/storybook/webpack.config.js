/* global __dirname, require, module*/

const webpack = require('webpack');
const path = require('path');

/*const env = require('yargs').argv.env || {};
const folder = env.folder || 'docs';
const isBuild = env.env === 'build';
const isLibrary = folder !== 'docs';*/

const config = {
  /*entry: __dirname + '/' + folder + '/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/' + folder + '/dist',
    filename: 'index.min.js',
    publicPath: 'anyform/dist'
  },*/
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.png$/,
        loader: 'url-loader',
      }
    ]
  },
  /*devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: {
      index: './docs/index.html'
    }
  }*/
};

module.exports = config;