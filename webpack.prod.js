const Webpack = require("webpack");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const { merge } = require("webpack-merge");

const commonConfig = require("./webpack.common");

module.exports = merge(commonConfig, {
    mode: "production",

    devtool: "source-map",

    optimization: {
        minimize: true,
        minimizer: [
            "...",
            new JsonMinimizerPlugin({
                test: /\..*json/i
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
            ENV: JSON.stringify("production")
        })
    ]
});
