const { Schema, model, Types } = require("mongoose");
const dateFormat = require('dateformat');

const messageSchema = new Schema(
    {
        text: {
            type: String,
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'UserModel'
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        collection: "messages",
        timestamps: true
    }
);

messageSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = dateFormat('isoUtcDateTime');
    }

    if (this.isNew || this.isModified('updatedAt')) {
        this.updatedAt = dateFormat('isoUtcDateTime');
    }
    
    next();
});

exports.MessageModel = model("MessageModel", messageSchema);

exports.formatForResponse = (modelObj) => {
    const { _id, text, author, createdAt, user } = modelObj;
    const doesFiveMinutesPast = ((Date.now() - new Date(createdAt)) / (1000 * 60)) > 5;
    const authorId = author._id ? author._id : author;
    const authorName = author.person ? author.person.fullname : user.person.fullname;
    
    // Format date
    let date = new Date(createdAt);
    date = dateFormat(date, 'yyyy-mm-dd hh:MM');

    return {
        _id,
        author: authorName,
        text,
        createdAt: date,
        editable: authorId.equals(user._id) && !doesFiveMinutesPast,
        deletable: authorId.equals(user._id)
    };
};
