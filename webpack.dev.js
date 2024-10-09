const Webpack = require("webpack");
const { merge } = require("webpack-merge");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const commonConfig = require("./webpack.common");

module.exports = merge(commonConfig, {
    mode: "development",

    devtool: "eval-source-map",

    stats: "minimal",

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
            ENV: JSON.stringify("development")
        }),
        new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerPort: 3002 })
    ]
});
