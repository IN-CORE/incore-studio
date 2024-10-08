const Webpack = require("webpack");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "production",
    resolve: {
        modules: ["node_modules", "src"],
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "@app": path.resolve(__dirname, "src/"),
            "@mui/material": "@mui/joy"
        }
    },
    devtool: "source-map",
    entry: [
        "maplibre-gl/dist/maplibre-gl.css",
        "maplibre-gl-basemaps/lib/basemaps.css",
        path.resolve(__dirname, "src/styles/main.scss"),
        path.resolve(__dirname, "src/App.tsx"),
        path.resolve(__dirname, "src/webpack-public-path")
    ],
    target: "web",
    context: __dirname,
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "/studio/",
        // assetModuleFilename: "files/[name]-[hash].[ext]",
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
    optimization: {
        minimize: true,
        minimizer: [
            "...",
            new JsonMinimizerPlugin({
                test: /\..*json/i
            }),
            new TerserPlugin({
                terserOptions: {
                    ecma: 8,
                    compress: {
                        warnings: false
                    }
                }
            })
        ],
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendor: {
                    test(module) {
                        return (
                            module.resource &&
                            !module.resource.endsWith(".css") &&
                            module.resource.match(/[\\/]node_modules[\\/]/)
                        );
                    },
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace("@", "")}`;
                    }
                },
                // Create a commons chunk, which includes all code shared between entry points.
                commons: {
                    name: "commons",
                    chunks: "initial",
                    minChunks: 2
                }
            }
        }
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
