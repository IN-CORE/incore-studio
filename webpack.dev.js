const Webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const autoprefixer = require("autoprefixer");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    resolve: {
        modules: ["node_modules", "src"],
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "@app": path.resolve(__dirname, "src/"),
            // "@mui/material": "@mui/joy",
            "mapbox-gl": "maplibre-gl"
        }
    },
    devtool: "eval-source-map",
    entry: ["maplibre-gl/dist/maplibre-gl.css", "maplibre-gl-basemaps/lib/basemaps.css", "./src/App.tsx"],
    stats: "minimal",
    target: "web",
    context: __dirname,
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "/",
        filename: "[name].[chunkhash].js",
        crossOriginLoading: "anonymous",
        clean: true
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
        new HtmlWebpackPlugin({
            template: "src/index.html",
            favicon: "public/favicon.ico",
            minify: {
                removeComments: true,
                collapseWhitespace: true
            },
            inject: true
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: "public", to: "" }]
        }),
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
            { test: /\.ico$/, type: "asset/resource" },
            {
                test: /\.(jpe?g|png|gif)$/i,
                type: "asset/resource"
            },
            {
                test: /(\.css|\.scss)$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    { loader: "postcss-loader", options: { postcssOptions: { plugins: ["autoprefixer"] } } },
                    { loader: "sass-loader", options: { sourceMap: true } }
                ]
            }
        ]
    }
};
