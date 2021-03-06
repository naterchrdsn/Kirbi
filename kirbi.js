const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.green(`Starting Kirbi...`));
console.log(chalk.green(`Node version: ${process.version}`));

// Helpers
exports.require = filePath => {
	delete require.cache[path.join(path.dirname(require.main.filename), filePath)];
	return require(path.join(path.dirname(require.main.filename), filePath))(this);
};
exports.getFileContents = filePath => {
	try {
		return fs.readFileSync(path.join(path.dirname(require.main.filename), filePath), 'utf-8');
	} catch (err) {
		console.log(chalk.red(err));
		return '';
	}
};
exports.getFileArray = srcPath => {
	try {
		srcPath = path.join(path.dirname(require.main.filename), srcPath);
		return fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isFile());
	} catch (err) {
		console.log(chalk.red(err));
		return [];
	}
};
exports.getJsonObject = filePath => {
	return JSON.parse(exports.getFileContents(filePath));
};
exports.resolveMention = usertxt => {
	let userid = usertxt;
	if (usertxt.startsWith('<@!')) {
		userid = usertxt.substr(3, usertxt.length - 4);
	} else if (usertxt.startsWith('<@')) {
		userid = usertxt.substr(2, usertxt.length - 3);
	}
	return userid;
};

exports.Auth = require('./lib/auth');
exports.Config = require('./lib/config');
exports.Permissions = require('./lib/permissions');
require('./lib/commands')(this);

// Initialize AI
if (exports.Config.elizaEnabled && !exports.Eliza) {
	const Eliza = require('./extras/eliza');
	exports.Eliza = new Eliza();
	console.log('Eliza enabled.');
	exports.Eliza.memSize = 500;
}

// Bot login
exports.login = () => {
	if (exports.Config.discord.enabled) {
		try {
			require('kirbi-discord').discordLogin(this);
		} catch (err) {
			console.log(chalk.red(err));
		}
	}
	if (exports.Config.slack.enabled) {
		try {
			require('kirbi-slack').slackLogin(this);
		} catch (err) {
			console.log(chalk.red(err));
		}
	}
};
