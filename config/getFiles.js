const fs = require("fs");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveFile = filePath => path.resolve(appDirectory, filePath);

module.exports = {
    resolveFile,
    ddConfigFileUrl: resolveFile(".dd.js"),
    pkgFileUrl: resolveFile("package.json"),
    appPublic: resolveFile('public'),
    appHtml: resolveFile('public/index.html'),
    cacheFolder: resolveFile(".cache"),
    cacheWebPackFile: resolveFile(".cache/webpack"),
    cacheBabelLoaderFile: resolveFile(".cache/babel-loader"),
    cacheRecordFile: resolveFile('.cache/record.json'),
}