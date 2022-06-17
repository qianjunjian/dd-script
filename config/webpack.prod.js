const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const common = require("./webpack.common");
var WebpackBar = require("webpackbar");
const path = require("path");
const dayjs = require("dayjs");
const HtmlInsertPlugin = require("./htmlInsertPlugin");
const { converUrlListByNodeEnv } = require("./getVconsole");
const { ddConfigFileUrl, resolveFile, appHtml } = require("./getFiles");
const { getCssFileName, getCssChunkFileName, pathJoin } = require("./getFileName");
const ddConfig = require(ddConfigFileUrl);
const releasePath = resolveFile(ddConfig.releasePath || "release");
const reactVendor = ddConfig.reactVendor || [];
const libVendor = ddConfig.libVendor || [];
const timeStamp = dayjs().format('YYYYMMDDHH');

const cssFileName = getCssFileName(ddConfig.assetsDir);
const cssChunkFileName = getCssChunkFileName(ddConfig.assetsDir)

function getModulePackageName(module) {
    if (!module.context) return null;
    let nodeModulesPath = resolveFile("node_modules");
    nodeModulesPath = path.join(nodeModulesPath, "/");
    if (module.context.substring(0, nodeModulesPath.length) !== nodeModulesPath) {
        return null;
    }
    const moduleRelativePath = module.context.substring(nodeModulesPath.length);
    const [moduleDirName] = moduleRelativePath.split(path.sep);
    let packageName = moduleDirName;
    if (packageName && packageName.match("^_")) {
        packageName = packageName.match(/^_(@?[^@]+)/)[1];
    }
    return packageName;
}

module.exports = merge(common, {
    mode: "production",
    output: {
        path: path.join(releasePath, ddConfig?.publicPath?.prd),
        publicPath: ddConfig?.publicPath?.prd || "",
        filename: pathJoin(ddConfig.assetsDir, "js/[name]." + timeStamp + ".[fullhash:8].js")
    },
    optimization: {
        minimizer: [
            new CssMinimizerPlugin({
                parallel: true
            }),
            new TerserPlugin({
                parallel: true,
                extractComments: false,
                terserOptions: {
                    compress: {
                        passes: 2,
                        drop_debugger: true,
                        drop_console: true
                    },
                    format: {
                        comments: false
                    },
                    safari10: true
                }
            })
        ],
        splitChunks: {
            chunks: "all",
            minSize: 0,
            cacheGroups: {
                reactRel: {
                    chunks: "all",
                    name: "reactRel",
                    test: (module) => {
                        const packageName = getModulePackageName(module) || "";
                        if (packageName) {
                            return reactVendor.includes(packageName);
                        }
                        return false;
                    },
                    priority: 10
                },
                libRel: {
                    chunks: "all",
                    name: "libRel",
                    test: (module) => {
                        const packageName = getModulePackageName(module) || "";
                        if (packageName) {
                            return libVendor.includes(packageName);
                        }
                        return false;
                    },
                    priority: 9
                },
                vendor: {
                    name: "vendors",
                    test({ resource }) {
                        return /[\\/]node_modules[\\/]/.test(resource);
                    },
                    priority: 8
                }
            }
        }
    },
    plugins: [
        ddConfig.useAnalyzer && new BundleAnalyzerPlugin(),
        new WebpackBar(),
        new HtmlInsertPlugin({
            useVConsole: ddConfig?.useVConsole,
            beforeInner: converUrlListByNodeEnv(ddConfig?.insertHtml?.beforeInner),
            afterInner: converUrlListByNodeEnv(ddConfig?.insertHtml?.afterInner)
        }),
        new HtmlWebpackPlugin({
            filename: path.join(releasePath, "main.html"),
            template: appHtml,
            inject: "body",
            chunksSortMode: "manual",
            xhtml: true
        }),
        new MiniCssExtractPlugin({
            filename: cssFileName,
            chunkFilename: cssChunkFileName
        }),
        ...(ddConfig?.plugins?.dev || [])
    ].filter(Boolean)
})