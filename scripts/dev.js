process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

process.on('unhandledRejection', err => {
    throw err;
});

const { choosePort, createCompiler, prepareUrls } = require("react-dev-utils/WebpackDevServerUtils");
const cmd = require('node-cmd');
const webpack = require("webpack");
const path = require("path");
const { shouldClearCache } = require("../config/clearCache");
const WebpackDevServer = require("webpack-dev-server");
const openBrowser = require("react-dev-utils/openBrowser");
const clearConsole = require('react-dev-utils/clearConsole');
const getPort = require('../utils/getPort');
const { ddConfigFileUrl, pkgFileUrl, appPublic, resolveFile } = require("../config/getFiles")

const ddConfig = require(ddConfigFileUrl);
const pkg = require(pkgFileUrl);

const DEFAULT_PORT = parseInt(ddConfig?.devServer?.port, 10) || 3000;
const HOST = ddConfig?.devServer?.host || '0.0.0.0';
process.env.HOST = HOST;

shouldClearCache();

choosePort(HOST, DEFAULT_PORT).then(async port => {
    if (port == null) {
        return;
    }
    process.env.PORT = port;

    if (ddConfig?.useMock) {
        let apiPort = await getPort({port: Number(port) + 1})
        process.env.apiPORT = apiPort;
    }

    let devServer = "";
    if (ddConfig?.useMerroyBuild) {
        const config = require("../config/webpack.dev");
        const publicPath = ddConfig?.devServer?.publicPath ?? "";
        const urls = prepareUrls(
            "http",
            HOST,
            port,
            publicPath
        );
        // 使用内存缓存文件
        const compiler = createCompiler({
            appName: pkg.name,
            config,
            urls,
            useYarn: false,
            webpack,
        });
        devServer = new WebpackDevServer(
            {
                host: HOST,
                port,
                allowedHosts: 'all',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*',
                    'Access-Control-Allow-Headers': '*'
                },
                compress: true,
                static: {
                    directory: appPublic,
                    publicPath: [ '/' ],
                },
                https: false,
                historyApiFallback: { 
                    disableDotRule: true, 
                    index: '/' 
                },
                proxy: ddConfig?.useMock ? {
                    '/mockApi/**':  {
                        target: "http://0.0.0.0:" + process.env.apiPORT,
                        changeOrigin: true,
                        secure:false,
                        pathRewrite: {
                            '^/mockApi': '/' 
                        }
                    },
                }: {}
            },
            compiler
        )
    
        devServer.startCallback(() => {
            if (process.stdout.isTTY) {
                clearConsole();
            }
            if (ddConfig?.devServer?.open) {
                openBrowser(urls.localUrlForBrowser);
            }
        });
    } else {
        const webpackConfig = path.resolve(__dirname, "../config/webpack.dev.js");
        const processRef = cmd.run(`webpack --config=${webpackConfig} --progress --color --watch`);
        processRef.stdout.pipe(process.stdout);
        processRef.stderr.pipe(process.stderr);
    }

    if (ddConfig?.useMock) {
        const _www = path.resolve(__dirname, "../bin/www");
        const processApiRef = cmd.run(`nodemon ${_www} --watch ./mocks`);
        processApiRef.stdout.pipe(process.stdout);
        processApiRef.stderr.pipe(process.stderr);
    }

    process.on("SIGINT", function () {
        devServer && devServer.close();
        process.exit();
    });

    process.on("SIGTERM", function () {
        devServer && devServer.close();
        process.exit();
    });

    process.stdin.on('end', function () {
        devServer && devServer.close();
        process.exit();
    });
}).catch(err => {
    if (err && err.message) {
        console.log(err.message);
    }
    process.exit(1);
});
