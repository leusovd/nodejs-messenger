const { Schema, model } = require("mongoose");
const { hashSync } = require('bcryptjs');

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        role: {
            type: String,
            trim: true,
            enum: ['superadmin', 'admin', 'user'],
            default: 'user'
        },
        person: {
            fullname: {
                type: String,
                default: null
            },
            gender: {
                type: String,
                enum: ['male', 'female']
            },
            job: String
        },
        permissions: {
            roleChange: {
                type: Boolean,
                default: false
            },
            accountsActivation: {
                type: Boolean,
                default: false
            }
        },
        messages: [{
            type: Schema.Types.ObjectId,
            ref: 'MessageModel'
        }],
        accountState: {
            type: String,
            enum: ['active', 'deactivated'],
            default: 'active'
        }
    },
    {
        collection: 'users',
        timestamps: true
    }
);

userSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('password')) {
        this.password = hashSync(this.password, 8);
    }

    if (this.isNew || this.isModified('role')) {

        if (this.role === 'superadmin') {
            this.permissions = Object.assign(this.permissions, { 
                roleChange: true 
            });
        }
    }

    next();
});

module.exports = model("UserModel", userSchema);
