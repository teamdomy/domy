const path = require("path");

function load(pathway) {
  return path.join(__dirname, '..', 'node_modules', pathway);
}

module.exports = {
  resolveLoader: {
    modules: [path.join(__dirname, '..', 'node_modules')],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              load("@babel/preset-env"),
              load("@babel/preset-react")],
            plugins: [
              load("@babel/plugin-proposal-object-rest-spread")
            ]
          }
        }
      }
    ]
  },
  resolve: {
    modules: [path.join(__dirname, '..', 'node_modules')],
    extensions: [ ".tsx", ".ts", ".jsx", ".js" ],
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  target: "web",
  entry: {},
  output: {}
};
