const Path = require("path");
const webpack = require('webpack');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const common = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [require("@babel/plugin-proposal-object-rest-spread")]
          }
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      "package.json",
      "README.md",
      "CHANGELOG.md",
      "LICENSE.md"
    ]),
    new UglifyJsPlugin({
      sourceMap: false,
      uglifyOptions: {
        minimize: true,
        compress: true,
        output: {
          comments: false,
          beautify: false
        }
      }
    })
  ],
  devtool: "inline-source-map",
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  }
};


const backend = {
  entry: {
    "index": "./index.ts",
  },
  output: {
    path: Path.resolve(__dirname, "build"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
    library: "domy-cli"
  },
  externals: {
    // child_process: "child_process",
    // path: "path",
    // http: "http",
    // os: "os"
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  }
};

module.exports = [
  Object.assign(backend, common)
];
