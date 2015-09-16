var webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    HtmlPlugin = require('./plugins/html-plugin'),
    path = require('path');

var getEnvironment = function() {
  try {
    // Try to import the environment module
    return require('./environment.json');
  } catch (error) {
    // If it does not exist, return an empty object
    if (error.code == 'MODULE_NOT_FOUND') {
      return {};
    }
  }
  // Return undefined if any other error occur
  return undefined;
};

module.exports = {
  devtool: 'source-map',

  entry: {
    'script': './scripts/index.js',
    'style': './styles/index.less',
  },

  module: {
    loaders: [
      { test: /\.txt$/, loader: 'text-loader'},
      { test: /\.json$/, loader: 'json-loader'},
      { test: /\.js$/, exclude: /(node_modules|bower_components)\//, loader: 'babel-loader'},
      { test: /\.(ttf.*|eot.*|woff.*|ogg|mp3)$/, loader: 'file-loader'},
      { test: /.(png|jpe?g|gif|svg.*)$/, loader: 'file-loader!img-loader?optimizationLevel=7&progressive=true'},
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader'),
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),
    new HtmlPlugin('index.html'),
    new webpack.DefinePlugin({
      Environment: JSON.stringify(getEnvironment()),
    }),
  ],

  resolve: {
    root: path.join(__dirname, 'js'),
    extensions: ['', '.js', '.json'],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
};
