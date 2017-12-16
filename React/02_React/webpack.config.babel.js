import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';

const common = {
  entry: './app/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      { test: /\.(js)$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.scss$/, 
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [ 'css-loader?sourceMap=true', 'sass-loader?sourceMap=true' ] 
        })
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'app'), 'node_modules'] 
  },
  stats: {
    children: false
  }
};

const development = {
  devtool: 'cheap-module-inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new ExtractTextPlugin('style.css'),
    new HtmlWebpackPlugin({
      template: 'app/index.html',
      filename: 'index.html',
      inject: 'body',
    })
  ],
};

const production = {
  devtool: 'cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new ExtractTextPlugin('style.css'),
    new HtmlWebpackPlugin({
      template: 'app/index.html'
    }),
    new webpack.optimize.UglifyJsPlugin()
  ], 
};

const extended = (process.env.NODE_ENV === 'production')
  ? production
  : development;

export default Object.assign({}, common, extended);
