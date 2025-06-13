const Webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require("autoprefixer");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "production",
    resolve: {
        modules: ["node_modules", "src"],
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "@app": path.resolve(__dirname, "src/")
            // "@mui/material": "@mui/joy",
        }
    },
    devtool: "source-map",
    entry: ["maplibre-gl/dist/maplibre-gl.css", "./src/App.tsx"],
    target: "web",
    context: __dirname,
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "/studio/",
        filename: "[name].[chunkhash].js",
        crossOriginLoading: "anonymous",
        clean: true
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
                test: /\.js$/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.eot(\?v=\d+.\d+.\d+)?$/,
                type: "asset/inline"
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                type: "asset/inline"
            },
            {
                test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
                type: "asset/inline"
            },
            {
                test: /\.svg(\?v=\d+.\d+.\d+)?$/,
                type: "asset/inline"
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                type: "asset/resource"
            },
            { test: /\.ico$/, type: "asset/resource" },
            {
                test: /(\.css|\.scss)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: ["autoprefixer"]
                            }
                        }
                    },
                    "sass-loader"
                ]
            }
        ]
    },
    optimization: {
        minimize: true,
        runtimeChunk: "single",
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    ecma: 8,
                    compress: {
                        warnings: false
                    }
                }
            })
        ]
    },

    plugins: [
        new Webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production"),
                INCORE_REMOTE_HOSTNAME: JSON.stringify(process.env.INCORE_REMOTE_HOSTNAME)
            },
            "__DEV__": false
        }),
        new HtmlWebpackPlugin({
            template: "src/index.html",
            favicon: "public/favicon.ico",
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
        new CopyWebpackPlugin({
            patterns: [{ from: "public", to: "" }]
        }),
        new Webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
        new Webpack.LoaderOptionsPlugin({
            debug: true,
            options: {
                sassLoader: {
                    includePaths: [path.resolve(__dirname, "src", "scss")]
                },
                context: "/",
                postcss: [autoprefixer()]
            }
        })
    ]
};
