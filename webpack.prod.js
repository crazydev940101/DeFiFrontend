var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// const CompressionPlugin = require('compression-webpack-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
    port: 7777,
    host: 'localhost',
    // proxy: {'/api': "http://localhost:7777"},
    compress: true,
    devMiddleware: {
      // provide default when mime-type evals to false.
      mimeTypes: {html: 'text/html'}
    }
  },
  performance: {
    hints: false,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        // this is so that we can compile any React,
        // ES6 and above into normal ES5 syntax
        test: /\.(?:js|mjs|cjs)$/,
        // we do not want anything from node_modules to be compiled
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Add any additional presets you need            
          },
        },
      },
      {
        test: /\.(css|scss)$/, // Apply the loader to CSS files
        use: [MiniCssExtractPlugin.loader,  'css-loader', 'sass-loader'], // Use the style-loader and css-loader
      },
      { 
        test: /\.(png|jpe?g|jpg|jpeg|gif|mp3|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/',
              publicPath: '/assets/',
            },
          },
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname,'public','index.html')
    }),
    new MiniCssExtractPlugin(),
    // new CompressionPlugin(),
  ]
};