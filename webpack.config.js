const HtmlWebPackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path')

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              exclude: '/node_modules'
            }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.mp3$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.wav$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.scss']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html'
    })
  ],
  entry: {
    index: path.resolve(__dirname, './src/index.js')
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].bunde.js'
  }
}