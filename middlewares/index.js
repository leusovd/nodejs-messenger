const { celebrate } = require('celebrate');
const { pushReqData } = require('../helpers/request-logger');
const dateFormat = require('dateformat');

exports.validate = (schema) => {
    return (req, res, next) => {
        celebrate(schema, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: {
                objects: true
            }
        })(req, res, next);
    }
};

exports.handleMessagesQueryParams = (req, res, next) => {
    let { sort, sortValue, limit, skip } = req.query;

    sort = sort && (typeof sort === 'string') ? sort : 'createdAt';
    sortValue = sortValue && (sortValue === 'asc' || sortValue === 'desc') ? sortValue : 'desc';

    const sortOpts = {};
    sortOpts[sort] = sortValue;

    req.query = Object.assign(req.query, {
        sort,
        sortValue,
        sortOpts,        
        limit: limit && !isNaN(+limit) && limit > 0 && limit < 51 ? +limit : 20,
        skip: skip && !isNaN(+skip) && skip > 0 && skip < 501 ? +skip : 0
    });

    next();
};

exports.requestInfo = (req, res, next) => {
    const start = Date.now();

	const afterResponse = () => {
		res.removeListener('finish', afterResponse);
        res.removeListener('close', afterResponse);
        
        let duration = dateFormat(Date.now() - start, 'l');
		pushReqData(req.headers['user-agent'], res.statusCode, duration);
		
	}

	res.on('finish', afterResponse);
	res.on('close', afterResponse);

	next();
};

exports.authGuardReverse = (req, res, next) => {
    if (req.user) {
        return res.redirect(302, '/');
    }

    next();
};

exports.authGuard = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.redirect(401, '/login');
    }
};

exports.adminGuard = (req, res, next) => {
    const user = req.user;

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        res.redirect('back');
    } else {
        next();
    }
};

exports.roleDowngradePermissionGuard = (req, res, next) => {
    const user = req.user;

    if (!user || !user.permissions.roleChange) {
        throw { message: 'Not allowed' };
    } else {
        next();
    }
}