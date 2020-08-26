const path = require('path');
const fs = require('fs');

const streams = {};

exports.writeLog = function(data, name) {
	const logsFolderPath = path.join(__dirname, '..', 'logs');
	const date = new Date();
	const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
	const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
	const year = date.getFullYear();
	const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
	const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
	const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

	const currentDateStr = `${day}.${month}.${year}`;
	const currentTimeStr = `${hours}:${minutes}:${seconds}`;

	if (!fs.existsSync(logsFolderPath)) {
		fs.mkdirSync(logsFolderPath);
	}
	
	if (!streams[name]) {
		streams[name] = fs.createWriteStream(path.join(logsFolderPath, `${name}-${currentDateStr}.log`), {flags: 'a'});
	}

	streams[name].write(`${currentDateStr}-${currentTimeStr} ${data}\n`);
};