const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  module: {
    rules: [
      ...require('./webpack.rules'),
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|wav|mp3|ogg)$/,
        type: 'asset/resource',
        generator: { filename: 'assets/[name].[contenthash:8][ext]' },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared/'),
      '@components': path.resolve(__dirname, 'src/renderer/components/'),
      '@models': path.resolve(__dirname, 'src/renderer/models/'),
      '@data': path.resolve(__dirname, 'src/renderer/data/'),
    },
  },
  output: {
    globalObject: 'self',
  },
  plugins: [
    // 練習で使う言語だけ読み込んでバンドルを軽くする
    new MonacoWebpackPlugin({
      languages: ['csharp', 'cpp', 'python', 'javascript', 'typescript', 'java', 'markdown'],
    }),
  ],
};
