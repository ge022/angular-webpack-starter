const webpack = require('webpack');
const path = require('path');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {SuppressExtractedTextChunksWebpackPlugin} = require('@angular-devkit/build-angular/src/angular-cli-files/plugins/suppress-entry-chunks-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ChunkRenamePlugin = require('webpack-chunk-rename-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const merge = require('webpack-merge');

const sharedConfig = {
    entry: {
        app: './src/main',
        styles: './src/assets/styles/styles',
    },
    output: {
        path: path.resolve(__dirname, 'public'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.scss'],
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'raw-loader',
            },
            {
                test: /\.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
                loader: 'file-loader',
                options: {
                    name(file) {
                        return '[name].[ext]';
                    },
                    outputPath: path.resolve(__dirname, 'public'),
                }
            },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack',
            },
            {
                // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
                // Removing this will cause deprecation warnings to appear.
                test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
                parser: {system: true},
            },
        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendors: false,
                vendor: {
                    // Split each node package into a chunk
                    name(module) {
                        // Get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        // Npm package names are URL-safe, but some servers don't like @ symbols
                        return `${packageName.replace('@', '')}`;
                    },
                    chunks: 'initial',
                    test: (module, chunks) => {
                        // Exclude the global styles
                        const moduleName = module.nameForCondition ? module.nameForCondition() : '';
                        return /[\\/]node_modules[\\/]/.test(moduleName) &&
                            !chunks.some(({name}) => name === 'polyfills' || name === 'styles');
                    },

                },
            }
        },
        runtimeChunk: 'single',
    },

    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
            entryModule: path.resolve(__dirname, './src/app/app.module#AppModule'),
            mainPath: path.resolve(__dirname, './src/main.ts'),
            sourceMap: true,
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            filename: 'index.html',
            excludeChunks: ['polyfills'],
            inlineSource: 'polyfillsLoader', // Inline the polyfill loader
            chunksSortMode: (chunk1, chunk2) => {
                let orders = ['polyfillsLoader']; // Prioritize the polyfills loader. Webpack loads the rest of the chunks as needed.
                let order1 = orders.indexOf(chunk1.names[0]);
                let order2 = orders.indexOf(chunk2.names[0]);
                return order2 - order1;
            },
            favicon: 'src/favicon.ico'
        }),
        new HtmlWebpackInlineSourcePlugin(),
        new CopyPlugin([
            {from: './src/assets/images', to: 'assets/images'},
            {from: './src/assets/icons', to: 'assets/icons'},
            {from: './src/manifest.json', to: 'manifest.json'},
        ]),
    ],
};

const developmentConfig = {
    mode: 'development',
    output: {
        filename: '[name].js',
    },
    performance: {
        hints: false,
    },
    devServer: {
        watchContentBase: false,
        hot: true,
        hotOnly: true,
        overlay: true,
        historyApiFallback: true,
    },
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                // Process the component styles
                exclude: path.resolve(__dirname, 'src/assets/styles/styles'),
                test: /\.(scss)$/,
                use: [
                    {loader: 'raw-loader'}, // Load component css as raw strings
                    {
                        loader: 'postcss-loader', // Process Tailwind CSS
                        options: {
                            config: {
                                ctx: {
                                    mode: 'development',
                                },
                            },
                            sourceMap: 'inline',
                        }
                    },
                    {
                        loader: 'sass-loader', // Compiles Sass to CSS
                    },
                ]
            },
            {
                // Process the global tailwind styles
                include: path.resolve(__dirname, 'src/assets/styles/styles'),
                test: /\.(scss)$/,
                use: [
                    {
                        loader: 'style-loader', // Allow for HMR
                    },
                    {
                        loader: 'postcss-loader', // Process Tailwind CSS
                        options: {
                            config: {
                                ctx: {
                                    mode: 'development',
                                },
                            },
                            sourceMap: 'inline',
                        }
                    },
                    {
                        loader: 'sass-loader', // Compiles Sass to CSS
                    },
                ]
            },
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ]
};

const productionConfig = {
    mode: 'production',
    entry: {
        polyfills: './src/polyfills',
        polyfillsLoader: './src/polyfills-loader',
        app: './src/main',
        styles: './src/assets/styles/styles.scss', // Ext needed for SuppressExtractedTextChunksWebpackPlugin
    },
    output: {
        filename: '[id].[contenthash].js',
    },
    module: {
        rules: [
            {
                // Process the component styles
                exclude: path.resolve(__dirname, 'src/assets/styles/styles'),
                test: /\.(scss)$/,
                use: [
                    {loader: 'raw-loader'}, // Load component css as raw strings
                    {
                        loader: 'postcss-loader', // Process Tailwind CSS
                        options: {
                            config: {
                                ctx: {
                                    mode: 'production',
                                },
                            },
                            sourceMap: false,
                        }
                    },
                    {
                        loader: 'sass-loader', // Compiles Sass to CSS
                    },
                ]
            },
            {
                // Process the global tailwind styles
                include: path.resolve(__dirname, 'src/assets/styles/styles'),
                test: /\.(scss)$/,
                use: [
                    {loader: MiniCssExtractPlugin.loader},
                    {loader: 'css-loader'},
                    {
                        loader: 'postcss-loader', // Process Tailwind CSS
                        options: {
                            config: {
                                ctx: {
                                    mode: 'production',
                                },
                            },
                            sourceMap: false,
                        }
                    },
                    {
                        loader: 'sass-loader', // Compiles Sass to CSS
                    },
                ]
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: '@angular-devkit/build-optimizer/webpack-loader',
                        options: {sourceMap: true},
                    },
                ],
            },
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                terserOptions: {
                    compress: {
                        pure_getters: true,
                        passes: 3,
                        global_defs: {
                            ngDevMode: false,
                        },
                    },
                    output: {
                        ascii_only: true,
                        comments: false,
                        safari10: true,
                        webkit: true,
                    },
                },
                sourceMap: true,
            }),
            new OptimizeCSSAssetsPlugin()
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[id].[contenthash].css',
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[id].js.map',
            exclude: ['polyfillsLoader', 'polyfills'],
            append: false, // The source filename must be manually added in the browser dev tool.
            noSources: true, // Only include the module names, paths, and line numbers.
        }),
        new webpack.HashedModuleIdsPlugin(), // Hash the variable module ids that are inside each chunk
        new ChunkRenamePlugin({
            polyfillsLoader: '[name].js', // Inline in HtmlWebpackPlugin
            polyfills: '[name].js', // Exclude in HtmlWebpackPlugin
        }),
        new SuppressExtractedTextChunksWebpackPlugin(),
        new LicenseWebpackPlugin({
            stats: {
                warnings: false,
                errors: false,
            },
            perChunkOutput: false,
            outputFilename: '3rdpartylicenses.txt',
        }),
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true, // Take over existing clients
            skipWaiting: false, // Skipping waiting will break lazy load navigation
            chunks: [ // Precaching
                'runtime', 'angular',
                'rxjs', 'tslib',
                'webpack', 'zone.js',
                'app', 'styles'
            ],
            include: [/\.html$/, /\.js$/, /\.css$/],
            runtimeCaching: [
                {
                    urlPattern: /\/$/, // Runtime cache the index.html because the src/index.html doesn't change for precaching updates
                    handler: 'NetworkFirst'
                },
                {
                    urlPattern: /\/.*\.js$/, // Cache same-origin js for lazy-loaded modules
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'app-js',
                        expiration: {
                            maxEntries: 30, // Only cache 30 files
                            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                        },
                    },
                },
                {
                    urlPattern: /\.css$/, // Cache same-origin css
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'app-css',
                        expiration: {
                            maxEntries: 30, // Only cache 30 files
                            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                        },
                    },
                },
                {

                    urlPattern: /api/,
                    // Apply a network-first strategy.
                    handler: 'NetworkFirst',
                },
                {
                    // Cache google fonts
                    urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                    handler: 'StaleWhileRevalidate',
                    options: {
                        cacheName: 'google-fonts-stylesheets',
                    },
                },
                {
                    // Cache google fonts
                    urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'google-fonts-webfonts',
                        cacheableResponse: {
                            statuses: [0, 200],
                        },
                        expiration: {
                            maxEntries: 30, // Only cache 30 fonts
                            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                        },
                    },
                },
                {
                    // Cache images
                    urlPattern: /\.(?:png|gif|jpg|jpeg|svg|ico)$/,
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'images',
                        expiration: {
                            maxEntries: 30, // Only cache 30 images
                            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                        },
                    },
                },
            ],
        }),
        // new CompressionPlugin(),
        // new BundleAnalyzerPlugin(),
    ],
};

module.exports = (mode = {}) => {
    if (mode === 'production') {
        return merge(sharedConfig, productionConfig);
    }

    return merge(sharedConfig, developmentConfig);
};