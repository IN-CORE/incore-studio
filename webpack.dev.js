const Webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",
    resolve: {
        modules: ["node_modules", "src"],
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "@app": path.resolve(__dirname, "src/"),
            "@mui/material": "@mui/joy"
        }
    },
    devtool: "eval-source-map",
    entry: [
        "maplibre-gl/dist/maplibre-gl.css",
        "maplibre-gl-basemaps/lib/basemaps.css",
        path.resolve(__dirname, "src/styles/main.scss"),
        path.resolve(__dirname, "src/App.tsx"),
        path.resolve(__dirname, "src/webpack-public-path")
    ],
    stats: "minimal",
    target: "web",
    context: __dirname,
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "",
        filename: "[name].[chunkhash].js",
        crossOriginLoading: "anonymous"
    },
    devServer: {
        hot: true,
        host: "localhost",
        port: 3000,
        historyApiFallback: true,
        open: true,
        allowedHosts: JSON.parse(process.env.ALLOWED_HOSTS || '["localhost"]'),
        headers: { "Access-Control-Allow-Origin": "*" }
    },

    plugins: [
        new Webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development"),
                INCORE_REMOTE_HOSTNAME: JSON.stringify(process.env.INCORE_REMOTE_HOSTNAME)
            },
            "__DEV__": true
        }),
        new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerPort: 3001 }),
        new HtmlWebpackPlugin({
            template: "src/index.html",
            favicon: "./src/public/favicon.ico",
            minify: {
                removeComments: true,
                collapseWhitespace: true
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
    ],
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
    }
};
