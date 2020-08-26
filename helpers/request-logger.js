const { writeLog } = require('./log.js');

const requests = [];

exports.setIntervalLog = function () {
	setInterval(() => {
		if (requests.length) {

			requests.forEach(request => {				
				const reqItemKeys = Object.keys(request);

				let	message = `User agent: ${request['user-agent']}`;

				reqItemKeys.forEach(key => {
					if (key !== 'user-agent') {
						message += `, ${key}: ${request[key]}`;
					}
				});				
				
				writeLog(message, 'requests');		
			});	

		}
	}, 10000);
}

exports.pushReqData = (ua, statusCode, duration) => {
	const request = requests.find(item => item['user-agent'] === ua);

	if (request) {
			
		if (request.hasOwnProperty(statusCode)) {
			request[statusCode]++;
		} else {
			request[statusCode] = 1;
		}

	} else {
		requests.push({
			'user-agent': ua,
            [statusCode]: 1,
            duration
		})
	}
}