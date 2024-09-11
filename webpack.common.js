const path = require('path');
const Dotenv = require('dotenv-webpack');
const Webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    target: 'web',

    context: __dirname,

    entry: {
        maplibre: 'maplibre-gl/dist/maplibre-gl.css',
        maplibreBasemapsControl: 'maplibre-gl-basemaps/lib/basemaps.css',
        appStyle: './src/styles/main.scss',
        config: './src/config.js',
        app: './src/App.tsx'
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: process.env.PUBLIC_PATH || '/',
        filename: (pathData) => {
            if (pathData.chunk.name === 'config') {
                return 'js/config.js';
            }
            return `js/${pathData.chunk.name}-${pathData.chunk.hash}.js`;
        },
        assetModuleFilename: 'files/[name]-[hash].[ext]',
        crossOriginLoading: 'anonymous'
    },

    module: {
        rules: [
            {
                // Use ts-loader for ts, tsx, js, and jsx files
                test: /\.[tj]sx?$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                test: /\.(s[ac]ss|css)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../'
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                type: 'javascript/auto',
                test: /\.(geo)?json$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'files/[name]-[hash].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.(jpg|jpeg|png|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'files/[name]-[hash].[ext]'
                        }
                    }
                ]
            }
        ]
    },

    resolve: {
        modules: ['node_modules', 'src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '@app': path.resolve(__dirname, 'src/'),
            '@mui/material': '@mui/joy'
        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new FaviconsWebpackPlugin({
            logo: './src/images/favicon.ico',
            prefix: 'icons/',
            emitStats: false,
            inject: true,
            favicons: {
                icons: {
                    android: false,
                    appleIcon: false,
                    appleStartup: false,
                    coast: false,
                    favicons: true,
                    firefox: false,
                    windows: false,
                    yandex: false
                }
            }
        }),
        new MiniCssExtractPlugin({ filename: 'css/[name]-[fullhash].css' }),
        new ESLintPlugin({
            emitWarning: true,
            failOnError: false
        }),
        new CleanWebpackPlugin(),
        new Dotenv({
            path: process.env.MODE === '' ? './.env' : `./.env.${process.env.MODE}` // Load .env file based on the passed NODE_ENV
        })
    ]
};
