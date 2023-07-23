var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
var webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
    port: 3000,
    host: '192.168.116.124',
    proxy: {'/api': "http://192.168.116.132:7777"},
    compress: true,
    devMiddleware: {
      // provide default when mime-type evals to false.
      mimeTypes: {html: 'text/html'}
    }
  },
  performance: {
    // hints: false,
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'], // Use the style-loader and css-loader
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
    new BundleAnalyzerPlugin(),
    new webpack.LoaderOptionsPlugin({
      // test: /\.xxx$/, // may apply this only for some modules
      options: {
        configureWebpack: {
          resolve: {
            mainFields: ['main', 'browser']
          }
        },
        alias: {
          // ...
          'ws': path.resolve(path.join( 'CTProjectFrontend/','./node_modules/userflow-electron/node_modules/ws/index.js', ),) // fix for https://github.com/websockets/ws/issues/1538
        },
      }
    }),
  ]
};