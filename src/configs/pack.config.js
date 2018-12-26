const path = require("path");

function load(pathway) {
  return path.join(__dirname, '..', 'node_modules', pathway);
}

module.exports = {
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
    extensions: [ ".tsx", ".ts", ".jsx", ".js" ],
  },
  resolveLoader: {
    modules: [path.join(__dirname, '..', 'node_modules')],
  },
  externals: {
    "react": "React",
    "redux": "Redux",
    "react-redux": "react-redux",
    "react-router-redux": "react-router-redux",
    "react-dom": "ReactDOM",
    "react-router-dom": "Route"
  },
  target: "web",
};
