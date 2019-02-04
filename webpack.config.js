const path = require("path");
const webpack = require("webpack");
const Uglify = require("uglifyjs-webpack-plugin");
const Copy = require("copy-webpack-plugin");

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
            presets: [
              "@babel/preset-env"
            ],
            plugins: [
              "@babel/plugin-proposal-object-rest-spread"
            ]
          }
        }
      }
    ]
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  }
};

const config = {
  entry: {
    "cli": "./src/main.ts",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bin/[name].js",
    libraryTarget: "commonjs2",
    library: "domy-cli"
  },
  externals: [
    "pad",
    "colors",
    "commander",
    "inquirer",
    /package.json/
  ],
  plugins: [
    new Uglify({
      sourceMap: true,
      uglifyOptions: {
        minimize: true,
        compress: true,
        output: {
          comments: false,
          beautify: false
        }
      }
    }),
    new webpack.BannerPlugin({
      banner: "#!/usr/bin/env node",
      raw: true
    }),
    new Copy([
      "package.json",
      "CHANGELOG.md",
      "LICENSE.md",
      "README.md"
    ])
  ],
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  }
};

module.exports = [
  Object.assign(config, common)
];
