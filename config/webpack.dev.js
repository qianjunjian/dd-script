const { ddConfigFileUrl, resolveFile, appHtml, cacheWebPackFile, appPublic } = require("./getFiles");
const { merge } = require("webpack-merge");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const common = require("./webpack.common");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const HtmlInsertPlugin = require("./htmlInsertPlugin");
const { converUrlListByNodeEnv } = require("./getVconsole");

const ddConfig = require(ddConfigFileUrl);

const getConfig = () => {
    const config = merge(common, {
        mode: "development",
        bail: false,
        devtool: ddConfig?.devtool || "cheap-module-source-map",
        output: {
            path: resolveFile(ddConfig?.buildPath || "build"),
            pathinfo: true,
            filename: "[name].js",
            chunkFilename: '[name].chunk.js',
            publicPath: ddConfig?.useMerroyBuild ? "/" : ddConfig?.publicPath?.dev ?? "./",
            devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
        },
        cache: {
            type: "filesystem",
            cacheDirectory: cacheWebPackFile,
            store: "pack",
            buildDependencies: {
                defaultWebpack: ["webpack/lib/"],
                config: [__filename]
            },
        },
        plugins: [
            new HtmlInsertPlugin({
                useVConsole: ddConfig?.useVConsole,
                beforeInner: converUrlListByNodeEnv(ddConfig?.insertHtml?.beforeInner),
                afterInner: converUrlListByNodeEnv(ddConfig?.insertHtml?.afterInner)
            }),
            new HtmlWebpackPlugin({
                template: appHtml,
                inject: "body",
                xhtml: true
            }),
            new CaseSensitivePathsPlugin(),
            ddConfig?.useReactRefresh &&
            new ReactRefreshWebpackPlugin({
                overlay: false,
            }),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),
            !ddConfig?.useMerroyBuild &&
            new BrowserSyncPlugin(
                {
                    host: process.env.HOST || "0.0.0.0",
                    port: process.env.PORT || 3000,
                    server: {
                        baseDir: [resolveFile(ddConfig?.buildPath || "build"), appPublic]
                    }
                },
                {
                    reload: true
                }
            ),
            ...(ddConfig?.plugins?.prd || [])
        ].filter(Boolean),
    });

    return config
}

module.exports = {
    ...getConfig()
}
