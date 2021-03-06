const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

var config = {
  devtool: isProd ? "hidden-source-map" : "source-map",
  context: path.resolve("./src"),
  entry: {
    karkas: "./index.ts"
  },
  output: {
    path: path.resolve("./dist"),
    filename: "[name].min.js",
    sourceMapFilename: "[name].min.js.map",
    devtoolModuleFilenameTemplate: function (info) {
        return "file:///" + info.absoluteResourcePath;
    }
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.ts?$/,
        exclude: ["node_modules"],
        use: ["awesome-typescript-loader", "source-map-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".ts"]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        // eslint-disable-line quote-props
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      output: { comments: false },
      sourceMap: true
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        tslint: {
          emitErrors: true,
          failOnHint: true
        }
      }
    }),
    new CopyWebpackPlugin([
      {
        from: '../dist/karkas.min.js',
        to: '../docs/karkas.min.js'
      },
      {
        from: '../dist/karkas.min.js.map',
        to: '../docs/karkas.min.js.map'
      },
    ])
  ]
};

module.exports = config;
