process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

process.on('unhandledRejection', err => {
    throw err;
});

const fs = require('fs-extra');
const webpack = require('webpack');
const config = require("../config/webpack.prod");
const path = require("path");
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const chalk = require('react-dev-utils/chalk');
const { ddConfigFileUrl, appPublic, appHtml, resolveFile } = require("../config/getFiles");
const formatStats = require("../config/formatStats");

const ddConfig = require(ddConfigFileUrl);
const releasePath = resolveFile(ddConfig.releasePath || "release");

function copyPublicFolder() {
    fs.copySync(appPublic, releasePath, {
        dereference: true,
        filter: file => file !== appHtml,
    });
}

fs.emptyDirSync(releasePath);
copyPublicFolder();

function build() {
    const compiler = webpack(config);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages;
            if (err) {
                if (!err.message) {
                    return reject(err);
                }
        
            } else {
                messages = formatWebpackMessages(
                    stats.toJson({ all: false, warnings: true, errors: true })
            );
            }
            if (messages.errors.length) {
            if (messages.errors.length > 1) {
                messages.errors.length = 1;
            }
                return reject(new Error(messages.errors.join('\n\n')));
            }

            resolve({
                stats,
                warnings: messages.warnings,
            });
        });
    });
}

build().then(({ stats, warnings }) => {
    if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
    }

    console.log(formatStats(stats, path.join(releasePath, ddConfig?.publicPath?.prd)))
}).catch(err => {
    if (err && err.message) {
        console.log(chalk.red(err.message));
    }
    process.exit(1);
});

