const { MessageModel, formatForResponse } = require('./messages.model');
const UserModel = require('../users/users.model');
const dateFormat = require('dateformat');

exports.postOne = async (req, res, next) => {
    const { text } = req.body;

    try {
        let message = new MessageModel({
            text,
            author: req.user._id
        });
        await message.save();

        await UserModel.updateOne(
            { _id: req.user._id }, 
            { $push: { messages: message._id }}
        );

        req.user.messages.push(message._id);
        message.user = req.user;

        res.send({ data: formatForResponse(message) });
    } catch (e) {
        next(e);
    }    
};

exports.getAll = async (req, res, next) => {
    const { sortOpts, limit, skip } = req.query;

    try {
        let messageList = await MessageModel
            .find({ deletedAt: null })
            .populate('author')
            .sort(sortOpts)
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    
        res.send({ 
            data: messageList.reverse().map(message => {
                message.user = req.user;
                return formatForResponse(message)
            }) 
        });
    } catch (e) {
        next(e);
    }
    
}

exports.updateOne = async (req, res, next) => {
    const { text } = req.body;
    const messageId = req.params.id;

    try {
        const message = await MessageModel.findOneAndUpdate(
            { _id: messageId }, 
            { text }
        ).lean().exec();  
        
        message.text = text;
        message.user = req.user;
        
        res.send({ data: formatForResponse(message) });
    } catch (e) {
        next(e);
    }
}

exports.deleteOne = async (req, res, next) => {
    const messageId = req.params.id;

    try {
        await MessageModel.updateOne({ _id: messageId }, 
            { deletedAt: dateFormat('isoUtcDateTime')});

        res.send({ status: 'ok', data: { _id: messageId } });
    } catch (e) {
        next(e);
    }
}

exports.deleteAll = async (req, res, next) => {
    const user = req.user;
    const authorId = req.query.authorId;
    let messages;

    try {  

        if (!authorId) {
            if (user.role !== 'superadmin') {
                throw { message: 'Not allowed' };
            }

            messages = await MessageModel.updateMany({ deletedAt: null }, 
                { deletedAt: dateFormat('isoUtcDateTime')});
        } else {
            messages = await MessageModel.updateMany({ userId: authorId, deletedAt: null }, 
                { deletedAt: dateFormat('isoUtcDateTime') });
        }

        res.send({ status: 'ok' });
    } catch (e) {
        next(e);
    }    
};