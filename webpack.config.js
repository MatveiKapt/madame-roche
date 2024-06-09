const HtmlWebpackPlugin = require('html-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');
const ImageminAvifWebpackPlugin= require("imagemin-avif-webpack-plugin");
const path = require('path');

let mode = 'development';

if (process.env.NODE_ENV === 'production') mode = 'production';

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode,
    entry: path.join(__dirname, 'src', 'index.js'),
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'index.[contenthash].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader'
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|webp)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },

    devtool: isProduction ? false : 'source-map',
    cache: !isProduction,

    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'template.html'),
        filename: 'index.html',
      }),
      new FileManagerPlugin({
        events: {
          onStart: {
            delete: ['dist'],
          },
        },
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/img'),
            to: path.resolve(__dirname, 'dist/img')
          },
        ]
      }),
    ],
    
    optimization: {
      minimize: true,
      minimizer: [
        (compiler) => {
          new TerserPlugin({
            terserOptions: {
              format: {
                comments: false
              }
            },
            extractComments: false,
          }).apply(compiler);
        },
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                }
              }
            ]
          }
        }),
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                ['jpegtran', { quality: 90 }],
                ['optipng', { optimizationLevel: 7 }],
              ],
            },
          },
        }),
        new ImageminWebpWebpackPlugin(),
        new ImageminAvifWebpackPlugin(),
      ],
    },

    devServer: {
      watchFiles: path.join(__dirname, 'src'),
      port: 3000,
      },
  }
};