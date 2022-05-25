#!/usr/bin/env node

process.on('unhandledRejection', err => {
  throw err;
});

const versionList = process.version.replace("v", "").split(".");
if (versionList && Number(versionList[0]) < 14) {
  console.log("---------- node版本太低，请使用14以上版本，推荐14.17.0版本 ----------");
  console.log("");
  process.exit(0);
}

const spawn = require('react-dev-utils/crossSpawn');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'dev' || x === 'test' || x === 'clear'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (['build', 'dev', 'test', 'clear'].includes(script)) {
  const result = spawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve('../scripts/' + script))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  );
  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
      );
    }
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log('Unknown script "' + script + '".');
}
