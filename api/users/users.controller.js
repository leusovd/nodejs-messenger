const UserModel = require('./users.model');

exports.getAll = async (req, res, next) => {
    try {
        const userList = await UserModel.find().lean().exec();
        res.send({ data: userList });
    } catch (e) {
        next(e);
    }    
}

exports.createOne = async (req, res, next) => {
    const { email, password, repeatPassword, role } = req.body;

    try {
        if (password !== repeatPassword) {
            throw { message: 'Passwords do not match' }
        }

        const user = new UserModel({ email, password, role });    
        await user.save();

        req.user = user;

        res.send({ status: 'ok', id: user.id });
    } catch (e) {
        next(e);
    }    
};

exports.updateOne = async (req, res, next) => {
    const targetId = req.params.id;
    const { role, accountState, permissions } = req.body;
    const documentUpdateConfig = { role, accountState, permissions };

    Object.keys(documentUpdateConfig).forEach(key => {
        if (!documentUpdateConfig[key]) delete documentUpdateConfig[key];
    });

    try {
        if (!targetId) {
            throw { message: 'Update target id is not defined'};
        }

        if (!Object.keys(documentUpdateConfig).length) {
            throw { message: 'Updatable values are not defined'};
        }

        await UserModel.updateOne({ _id: targetId }, documentUpdateConfig);

        res.send({ status: 'ok' });

    } catch (e) {
        next(e);
    }
}