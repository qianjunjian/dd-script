const { resolveFile, ddConfigFileUrl } = require("./getFiles");
const fs = require("fs");
const path = require("path");

const ddConfig = require(ddConfigFileUrl);

const nameList = [
    "vconsole.min.js",
    "vconsole.js"
]

const cdn = "https://unpkg.com/vconsole@latest/dist/vconsole.min.js";

function converUrlListByNodeEnv(urlList) {
    if (urlList && urlList.length > 0) {
        return urlList.map(url => {
            if (process.env.NODE_ENV === "development" && 
                ddConfig.useMerroyBuild &&
                url.startsWith(".")) {
                return url.slice(1);
            }
            return url;
        })
    }
    return [];
}

function getVconsole() {

    const libPath = resolveFile("public/lib");
    let file = nameList.find(fileName => {
       return fs.existsSync(path.resolve(libPath, fileName));
    })

    if (!file) {
        file = cdn;
    } else {
        file = converUrlListByNodeEnv(["./lib/" + file])[0];
    }

    return [
        {
            tagName: 'script',
            selfClosingTag: true,
            attributes: {
                src: file
            }
        },
        {
            tagName: 'script',
            selfClosingTag: true,
            innerHTML: "var vConsole = new window.VConsole();",
            voidTag: false,
            attributes: {
                type: "text/javascript"
            }
        }
    ]
}

module.exports = {
    getVconsole,
    converUrlListByNodeEnv
};