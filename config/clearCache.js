const fs = require("fs");
const path = require("path");
const { cacheRecordFile, cacheFolder } = require("./getFiles");
const { ddConfigFileUrl } = require("./getFiles");

const ddConfig = require(ddConfigFileUrl);

const deleteFolder = (folderPath) => {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((filePath)=> {
            var curPath = path.resolve(folderPath, filePath);
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
}

const shouldClearCache = () => {
    const isExist = fs.existsSync(cacheRecordFile);
    const current = new Date().getTime();
    if (isExist) {
        // 存在
        const data = require(cacheRecordFile);
        if (current > data.timeout) {
            // 清理缓存
            deleteFolder(cacheFolder);
            createRecordFile(current);
        }
    } else {
        // 不存在
        createRecordFile(current);
    }
}

const createRecordFile = current => {
    const day = ddConfig?.cacheTimeout || 7;
    fs.mkdirSync(cacheFolder);
    fs.writeFileSync(cacheRecordFile, JSON.stringify({
        timeout: current + day * 24 * 60 * 60 * 1000
    }))
}

const clearCache = () => {
    const current = new Date().getTime();
    // 清理缓存
    deleteFolder(cacheFolder);
    createRecordFile(current);
}

module.exports = {
    shouldClearCache,
    clearCache
}
