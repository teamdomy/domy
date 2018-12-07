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
            presets: ["@babel/preset-env"],
            plugins: [require("@babel/plugin-proposal-object-rest-spread")]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: "#!/usr/bin/env node",
      raw: true
    }),
    new Copy([
      "package.json",
      "README.md",
      "CHANGELOG.md",
      "LICENSE.md",
      { from: "src/configs/user.config.txt", to: "configs/user.config.txt"},
      { from: "src/configs/pack.config.js", to: "configs/pack.config.js"}
    ]),
    new Uglify({
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


// const frontend = {
//   entry: {
//     "index": "./index.ts"
//   },
//   output: {
//     path: path.resolve(__dirname, "build"),
//     filename: "[name].js",
//     libraryTarget: "var",
//     library: "domy",
//   },
//   target: "web"
// };

const backend = {
  entry: {
    "cli": "./src/main.ts",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bin/[name].js",
    libraryTarget: "commonjs2",
    library: "domy-cli"
  },
  externals: {
    fs: "fs",
    path: "path",
    http: "http",
    colors: "colors",
    commander: "commander",
    inquirer: "inquirer",
    pad: "pad",
    webpack: "webpack",
    "memory-fs": "memory-fs",
    "../configs/user.config.txt": "../configs/user.config.txt",
    "../configs/pack.config.js": "../configs/pack.config.js"
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  }
};

module.exports = [
  // Object.assign(frontend, common),
  Object.assign(backend, common)
];
