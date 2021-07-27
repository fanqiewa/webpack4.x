
// process 是node的进程
process.exitCode = 0;

const runCommand = (command, args) => {
    const cp = require("child_process");
    return new Promise((resolve, reject) => {
        // child_process.spawn() 方法使用给定的 command 衍生新的进程，并传入 args 中的命令行参数。 如果省略 args，则其默认为空数组。
        const executedCommand = cp.spawn(command, args, {
			stdio: "inherit",
            shell: true // 如果为 true，则在 shell 中运行 command
        });

        executedCommand.on("error", error => {
            reject(error);
        });

        executedCommand.on("exit", code => {
            if (code === 0) {
                resolve();
            } else {
                reject();
            }
        })
    })
}


/**
 * 判断一个包是否安装了
 * @param {string} packageName 包名
 * @returns {boolean} 这个包是否被安装了
 */
const isInstalled = packageName => {
    try {
        require.resolve(packageName);
        return true;
    } catch (err) {
        return false;
    }
}

// clis命令
const CLIs = [
    {
        name: "webpack-cli", // 名称
        package: "webpack-cli", // 包名
        binName: "webpack-cli",
        alias: "cli", // 别名
        installed: isInstalled("webpack-cli"),
        recommended: true, // 推荐
        url: "https://github.com/webpack/webpack-cli", // 网址
        description: "The original webpack full-featured CLI." // 描述
    },
    {
        name: "webpack-command",
        package: "webpack-command",
        binName: "webpack-command",
        alias: "command",
        installed: isInstalled("webpack-command"),
        recommended: false,
        url: "https://github.com/webpack-contrib/webpack-command",
        description: "A lightweight, opinionated webpack CLI."
    }
]




const installedClis = CLIs.filter(cli => cli.installed);

if (installedClis.length === 0) { // 如果一个都没安装
    const path = require("path");
    const fs = require("fs");
    const readLine = require("readline"); // 逐行读取

    let notify = 
    "One CLI for webpack must be installed. These are recommended choices, delivered as separate packages:";

    for (const item of CLIs) {
        if (item.recommended) {
			notify += `\n - ${item.name} (${item.url})\n   ${item.description}`;
        }
    }
    console.error(notify);
    // process.cwd 返回当前的工作目录
    // path.resolve 将路径解析为绝对路径
    // fs.existsSync 如果路径存在，则返回 true，否则返回 false。
    const isYarn = fs.existsSync(path.resolve(process.cwd(), "yarn.lock"));

    const question = `Do you want to install 'webpack-cli' (yes/no): `;

	const packageManager = isYarn ? "yarn" : "npm";
	const installOptions = [isYarn ? "add" : "install", "-D"];

    // 创建一个interface实例，可以监听'line'、'close'事件等
    const questionInterface = readLine.createInterface({
        input: process.stdin,
        output: process.stderr
    });
    // question() 方法通过将 query 写入 output 来显示它，并等待用户在 input 上提供输入，然后调用 callback 函数将提供的输入作为第一个参数传入。
    questionInterface.question(question, answer => {
        questionInterface.close();

        // 判断输入的字符串是否是以y开头
        const normalizedAnswer = answer.toLowerCase().startsWith("y");
        if (!normalizedAnswer) {
			console.error(
				"You need to install 'webpack-cli' to use webpack via CLI.\n" +
					"You can also install the CLI manually."
            );
            // 程序正常退出
			process.exitCode = 1;
			return;
        }
        const packageName = "webpack-cli";
        
		console.log(
			`Installing '${packageName}' (running '${packageManager} ${installOptions.join(
				" "
			)} ${packageName}')...`
        );
        
        runCommand(packageManager, installOptions.concat(packageName))
            .then(() => {
                require(packageName);
            })
            .catch(error => {
                console.error(error);
                // 程序正常退出
                process.exitCode = 1;
            })
    })
} else if (installedClis.length === 1) { // 如果安装了一个
    const path = require("path");
    const pkgPath = require.resolve(`${installedClis[0].package}/package.json`);

    // webpack-cli/package.json
    const pkg = require(pkgPath);

    require(path.resolve(
        path.dirname(pkgPath), // path.dirname() 方法会返回 path 的目录名 webpack-cli
        pkg.bin[installedClis[0].binName] // ./bin/cli.js
    )); // webpack-cli/bin/cli.js
} else { // 有多个cli命令是，应该移除一个
	console.warn(
		`You have installed ${installedClis
			.map(item => item.name)
			.join(
				" and "
			)} together. To work with the "webpack" command you need only one CLI package, please remove one of them or use them directly via their binary.`
	);

	process.exitCode = 1;
}
