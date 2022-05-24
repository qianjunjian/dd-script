const chalk = require('react-dev-utils/chalk');
const { clearCache } = require("../config/clearCache");

try {
    clearCache();
    console.log(
        chalk.greenBright("--------- clear success ---------")
    );
    console.log("");
} catch (e) {
    console.log(
        chalk.red(e)
    );
}
