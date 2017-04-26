/* global __dirname */
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
/* global process */
var clientDir = path.resolve(__dirname + '/../client');

var config = {
  devtool: process.env.NODE_ENV == 'production' ? null : 'inline-source-map',
  context: clientDir,
  resolveLoader:{root:path.join(path.resolve(__dirname + '/..'), 'node_modules')},
  entry: process.env.NODE_ENV == 'production' ? [
    './index'
  ] : [
    'webpack-hot-middleware/client',
    './index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.[hash].js',
    publicPath: '/virtual/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: clientDir+'/index.html'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': process.env.NODE_ENV ? JSON.stringify(process.env.NODE_ENV) : '"development"'
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: /node_modules/,
        include: clientDir
      },
      {
        test: /\.styl|\.css?$/,
        loaders: ['style', 'css-loader', 'resolve-url', 'stylus', 'postcss'],
        include: clientDir
      },
      {
        test: /\.css?$/,
        loaders: ['style', 'css-loader', 'resolve-url'],
        include: path.join(path.resolve(__dirname + '/..'), 'node_modules')
      },
      {
        test: /\.(png|ttf|eot|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'svg-url-loader'
      }
    ]
  },
  postcss: [ require('autoprefixer')({ browsers: ['last 2 versions'] }) ]
};
if (process.env.NODE_ENV == 'production'){
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  );
}
module.exports = config;
