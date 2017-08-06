const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/vuemix',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vuemix.dist.js',
    library: 'Vuemix',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    })
  ],
  module: {
    rules: [
      {
        include: [
          path.resolve(__dirname, 'src')
        ],
        exclude: [
          path.resolve(__dirname, 'node_modules')
        ],
        enforce: 'pre',
        loader: 'babel-loader',
        options: {
          presets: ['env']
        },
      }
    ]
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 2000,
    maxEntrypointSize: 5000,
    assetFilter: function (assetFilename) {
      return assetFilename.endsWith('.js');
    }
  },
  devtool: 'source-map',
  context: __dirname,
  target: 'web',
  stats: {
    color: true,
    errors: true,
    modules: true,
    performance: true,
    timings: true,
    warnings: true
  }
}