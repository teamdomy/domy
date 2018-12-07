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
            presets: ["@babel/preset-env", "@babel/react"],
            plugins: [require("@babel/plugin-proposal-object-rest-spread")]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".jsx", ".js" ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  target: "web",
  entry: {},
  output: {}
};
