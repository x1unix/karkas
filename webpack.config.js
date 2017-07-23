const webpack = require("webpack");
const path = require("path");
const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

var config = {
  devtool: isProd ? "hidden-source-map" : "source-map",
  context: path.resolve("./src"),
  entry: {
    app: "./index.ts",
    vendor: "./vendor.ts"
  },
  output: {
    path: path.resolve("./dist"),
    filename: "[name].js",
    sourceMapFilename: "[name].map",
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
    extensions: [".ts", ".js"]
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
    })
  ]
};

module.exports = config;
