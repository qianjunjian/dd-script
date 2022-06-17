const pathJoin = (path, path2) => {
    if (path) {
        if (!path.endsWith("/")) {
            return path + "/" + path2
        }
        return path + path2;
    }
    return path2;
}

const getCssFileName = assetsDir => pathJoin(assetsDir, "css/[name].[fullhash:8].css");
const getCssChunkFileName = assetsDir => pathJoin(assetsDir, "css/[id].[fullhash:8].css");

module.exports = {
    pathJoin,
    getCssFileName,
    getCssChunkFileName
}