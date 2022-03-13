const ChildProcess = require('child_process');


const runCmd = (cmd) => {
    return new Promise((resolve, reject) => {
        ChildProcess.exec(cmd, (err, ...args) => {
            if (err) reject();
            resolve(...args);
        })
    })
}

const checkYarnInstall = () => {
    return new Promise(resolve => {
        try {
            runCmd('yarn --version');
            resolve('yarn');
        } catch (error) {
            resolve('yarn error');
        }
    })
}

module.exports = {
    runCmd,
    checkYarnInstall
}