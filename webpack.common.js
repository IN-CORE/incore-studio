const path = require("path");
const Webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    target: "web",

    context: __dirname,

    entry: [
        "maplibre-gl/dist/maplibre-gl.css",
        "maplibre-gl-basemaps/lib/basemaps.css",
        path.resolve(__dirname, "src/styles/main.scss"),
        path.resolve(__dirname, "src/App.tsx"),
        path.resolve(__dirname, "src/webpack-public-path")
    ],
    // entry: {
    //     maplibre: "maplibre-gl/dist/maplibre-gl.css",
    //     maplibreBasemapsControl: "maplibre-gl-basemaps/lib/basemaps.css",
    //     appStyle: "./src/styles/main.scss",
    //     app: "./src/App.tsx",
    //     publicPath: "./src/webpack-public-path",
    // },

    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "/studio/",
        assetModuleFilename: "files/[name]-[hash].[ext]",
        filename: "[name].[chunkhash].js",
        crossOriginLoading: "anonymous"
    },

    module: {
        rules: [
            {
                // Use ts-loader for ts, tsx, js, and jsx files
                test: /\.[tj]sx?$/,
                exclude: /node_modules/,
                use: "ts-loader"
            },
            {
                test: /\.(s[ac]ss|css)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.svg$/,
                loader: "svg-inline-loader"
            },
            {
                test: /\.(jpg|jpeg|png|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "files/[name]-[hash].[ext]"
                        }
                    }
                ]
            }
        ]
    },

    resolve: {
        modules: ["node_modules", "src"],
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "@app": path.resolve(__dirname, "src/"),
            "@mui/material": "@mui/joy"
        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html",
            favicon: "./src/public/favicon.ico",
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            inject: true
        }),
        new Webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({ filename: "css/[name]-[fullhash].css" }),
        new ESLintPlugin({
            emitWarning: true,
            failOnError: false
        }),
        new CleanWebpackPlugin()
    ]
};
