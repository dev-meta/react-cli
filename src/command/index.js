const { runCmd, checkYarnInstall } = require("../utils");
const fse = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const { inquirerConfig, repo } = require("../config");
const download = require("download-git-repo");
const ora = require("ora");
const chalk = require("chalk");
const semverLt = require('semver/functions/lt');

class Init {
  constructor(name, options) {
    this.options = options;
    this.projectName = name;
    this.pathMap = {
      target: path.resolve(process.cwd(), name),
      repo: repo.js,
    };
    this.spinner = new ora();
    this.init();
  }
  async init() {
    this.checkNodeVersion();
    await this.checkFolder();
    await this.downloadRepo();
    await this.updateFiles();
    await this.install();
  }
  checkNodeVersion() {
    const nodeVer = process.version;
    const targetVer = '12.20.0';
    if(semverLt(nodeVer, targetVer)) {
      console.log();
      console.log(chalk.cyan(`  当前node版本是${nodeVer},可能出现异常，推荐升级到${targetVer}及以上`));
      console.log();
    }
  }
  // 检查文件夹是否存在
  checkFolder() {
    return new Promise(async (resolve, reject) => {
      const { target } = this.pathMap;
      if (this.options.force) {
        fse.removeSync(target);
        resolve();
      }
      try {
        const isExist = fse.pathExistsSync(this.pathMap.target);
        if (!isExist) return resolve();
        const { cover } = await inquirer.prompt(inquirerConfig.cover);
        if (cover === "new") {
          const { name } = await inquirer.prompt(inquirerConfig.create);
          this.pathMap.target = path.resolve(process.cwd(), name);
          this.projectName = name;
          resolve();
        } else if (cover === "cover") {
          fse.removeSync(target);
          resolve();
        } else {
          process.exit(1);
        }
      } catch (error) {
        console.log("error", error);
        process.exit(1);
      }
    });
  }

  // 下载
  async downloadRepo() {
    if (this.options.typescript) {
      this.pathMap.repo = repo.ts;
    }
    this.spinner.start("开始下载模板...");
    return new Promise((resovle, reject) => {
      const { repo, target } = this.pathMap;
      download(repo, target, { clone: true }, (err) => {
        if (err) return reject(err);
        this.spinner.succeed("模板下载成功");
        resovle();
      });
    });
  }
  // 更新文件内容
  async updateFiles() {
    this.spinner.start("开始更新模板文件...");
    const packagePath = path.resolve(this.pathMap.target, "package.json");
    const jsonData = fse.readJSONSync(packagePath);
    const data = Object.assign(jsonData, {
      name: this.projectName,
      version: "1.0.0",
      private: true,
    });
    fse.writeJsonSync(packagePath, data, { spaces: "\t" });
    this.spinner.succeed("模板更新成功");
  }
  // 安装依赖
  async install() {
    let packageManager = "npm";
    try {
      const yarnName = await checkYarnInstall();
      this.spinner.start("正在安装项目依赖，请稍后...");
      if (yarnName === "yarn") {
        packageManager = "yarn";
        await runCmd(`yarn install`);
      } else {
        await runCmd(`npm install`);
      }
      this.spinner.succeed("依赖安装完成");
      console.log("运行如下命令启动项目吧: \n");
      console.log(chalk.green(`   cd ${this.projectName}`));
      console.log(chalk.green(`   ${packageManager} start`));
    } catch (error) {
      this.spinner.stop();
      console.log("依赖安装失败, 请使用如下命令手动安装");
      console.log(chalk.green(`   cd ${this.projectName}`));
      console.log(chalk.green(`   ${packageManager} install`));
    }
  }
}

module.exports = Init;
