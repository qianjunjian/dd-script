const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { ddConfigFileUrl, resolveFile, cacheBabelLoaderFile } = require("./getFiles");

const ddConfig = require(ddConfigFileUrl);
const isEnvDevelopment = process.env.NODE_ENV === "development";

module.exports = {
    entry: {
        index: resolveFile("src/index.jsx")
    },
    target: ['browserslist'],
    stats: "errors-warnings",
    performance: {
        hints: false
    },
    infrastructureLogging: {
        level: 'none',
    },
    resolve: {
        extensions: ddConfig?.resolve?.extensions ?? [".js", ".jsx", ".json"],
        alias: ddConfig?.rseolve?.alias ?? {
            "@": resolveFile("src")
        }
    },
    module: {
        strictExportPresence: true,
        rules: [
            { 
                test: /\.(js|jsx|ts|tsx)$/,
                include: [
                    resolveFile("src"),
                    ddConfig?.babelTransformContains && ddConfig.babelTransformContains.map(fileUrl => resolveFile(fileUrl))
                ].filter(Boolean),
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: [
                            isEnvDevelopment && ddConfig?.useReactRefresh && require.resolve('react-refresh/babel'),
                        ].filter(Boolean),
                        cacheDirectory: isEnvDevelopment && cacheBabelLoaderFile,
                        cacheCompression: false,
                        compact: false
                    }
                }
            },
            {
                test: /\.less$/,
                exclude: /\.module\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {}
                    },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2,
                            sourceMap: isEnvDevelopment,
                            modules: {
                                // 启用 CSS 模块或者可交互 CSS 格式
                                // 为所有满足 /\.module(s)?\.\w+$/i.test(filename) 条件的文件设置 modules.mode 选项为 local，
                                // 或者为所有满足 /\.icss\.\w+$/i.test(filename) 条件的文件设置 modules.mode 选项为 icss
                                mode: 'icss',
                            },
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: isEnvDevelopment,
                            postcssOptions: {
                                plugins: [
                                    "postcss-flexbugs-fixes",
                                    [
                                        "postcss-preset-env",
                                        {
                                            autoprefixer: {
                                                // 设置“flexbox: false”会禁用flexbox属性的前缀，或者“flexbox:"no-2009"”只会为最新版本和IE版本浏览器添加前缀
                                                flexbox: 'no-2009',
                                            },
                                            stage: 3
                                        },
                                    ]
                                ]
                            }
                        }
                    },
                    {
                        loader: "less-loader",
                        options: {
                            sourceMap: isEnvDevelopment,
                        }
                    }
                ]
            },
            {
                test: /\.module\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {}
                    },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2,
                            sourceMap: isEnvDevelopment,
                            modules: {
                                // 启用 CSS 模块或者可交互 CSS 格式
                                // 为所有满足 /\.module(s)?\.\w+$/i.test(filename) 条件的文件设置 modules.mode 选项为 local，
                                // 或者为所有满足 /\.icss\.\w+$/i.test(filename) 条件的文件设置 modules.mode 选项为 icss
                                mode: 'local'
                            },
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: isEnvDevelopment,
                            postcssOptions: {
                                plugins: [
                                    "postcss-flexbugs-fixes",
                                    [
                                        "postcss-preset-env",
                                        {
                                            autoprefixer: {
                                                flexbox: 'no-2009',
                                            },
                                            stage: 3,
                                        },
                                    ]
                                ]
                            }
                        }
                    },
                    {
                        loader: "less-loader",
                        options: {
                            sourceMap: isEnvDevelopment,
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {}
                    },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2,
                            sourceMap: isEnvDevelopment,
                            modules: {
                                mode: 'icss',
                            },
                        }
                    },
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            publicPath: "./",
                            name: "images/[name].[hash].[ext]"
                        }
                    }
                ]
            },
            ...(ddConfig?.rules || [])
        ].filter(Boolean)
    }
}