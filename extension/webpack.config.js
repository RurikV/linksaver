const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DotenvPlugin = require("dotenv-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtReloader = require("webpack-ext-reloader");

module.exports = (env) => {
  const isProduction = env.production || false;

  return {
    mode: isProduction ? "production" : "development",
    entry: {
      content: "./src/content.js",
      options: "./src/options.js",
      background: "./src/background.js",
    },
    output: {
      path: path.resolve(__dirname, "build"),
      clean: true,
      filename: "[name].js",
    },
    devtool: "cheap-module-source-map",
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    plugins: [
      ...(!isProduction
        ? [
            new ExtReloader({
              reloadPage: false,
              entries: {
                contentScript: "content",
                background: "background",
                extensionPage: "options",
              },
            }),
          ]
        : []),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/options.html",
        filename: "options.html",
        chunks: ["options"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "./public", to: "./public" },
          { from: "./manifest.json" },
        ],
      }),
      new DotenvPlugin({
        path: path.resolve(
          __dirname,
          `./.env.${isProduction ? "production" : "development"}`
        ),
        silent: true,
      }),
    ],
  };
};
