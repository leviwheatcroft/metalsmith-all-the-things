import {
  resolve
} from 'path'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const extractLess = new ExtractTextPlugin({
  filename: '[name]-[chunkhash].css'
})

module.exports = [
  {
    entry: {
      cleanBlogJs: './src/js/cleanBlog.js'
    },
    output: {
      path: resolve(__dirname, 'build', 'js'),
      filename: '[name].[chunkhash].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [],
          exclude: [ /node_modules/ ],
          loader: 'babel-loader',
          options: {
            presets: [ 'es2015' ]
          }
        }
      ]
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_console: false
        }
      })
    ]
  },
  {
    entry: {
      'cleanBlogStyles': './src/styles/cleanBlog.less'
    },
    output: {
      path: resolve(__dirname, 'build', 'styles'),
      filename: '[name].[chunkhash].css'
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: extractLess.extract({
            use: [{
              loader: 'css-loader'
            }, {
              loader: 'less-loader'
            }],
            // use style-loader in development
            fallback: 'style-loader'
          })
        }
      ]
    },
    plugins: [
      extractLess
    ]
  }
]
