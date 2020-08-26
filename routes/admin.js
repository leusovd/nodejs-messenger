const { Router } = require("express");
const dateFormat = require("dateformat");
const UserModel = require("../api/users/users.model");
const { adminGuard } = require('../middlewares/index');
const router = new Router();

router.get("/", (req, res) => {
    res.render("pages/admin/index.njk", {
        pageName: "adminDashboard",
        title: "Admin Panel",
        active: "panel",
        user: req.user,
    });
});

router.get("/accounts", adminGuard, async (req, res, next) => {
    const authorizedUser = req.user;

    try {
        let userList = await UserModel.find({
            _id: { $ne: authorizedUser._id }
        }).populate('messages').lean().exec();

        userList = userList.map(user => {
            const mappedUserObj = Object.assign(user, {
                accountStateCapitalized: user.accountState.charAt(0).toUpperCase() + user.accountState.slice(1),
                roleCapitalized: user.role.charAt(0).toUpperCase() + user.role.slice(1),
                messagesCount: user.messages.filter(message => message.deletedAt === null).length,
                createdAt: dateFormat(user.createdAt, "dd mmm yyyy"),
            });
            delete mappedUserObj.messages;

            return mappedUserObj;
        });

        res.render("pages/admin/accounts.njk", {
            pageName: "adminAccounts",
            title: "Admin Panel",
            active: "panel",
            user: authorizedUser,
            userList,
        });
    } catch (e) {
        next(e);
    }
});

router.get("/accounts/:id", adminGuard, async (req, res, next) => {
    try {
        let selectedUser = await UserModel.findById({ _id: req.params.id })
            .populate({
                path: 'messages',
                match: { deletedAt: null }
            })
            .lean()
            .exec();

        selectedUser = Object.assign(selectedUser, {  
            roleCapitalized: selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1),     
            messagesCount: selectedUser.messages.length,
            createdAt: dateFormat(selectedUser.createdAt, "dd mmm yyyy"),
            messages: selectedUser.messages.map(message => {
                return Object.assign(message, { 
                    createdAt: dateFormat(message.createdAt, 'dd.mm.yyyy hh:MM') 
                });
            })
        });

        res.render("pages/admin/accountDetails.njk", {
            pageName: "adminAccountDetails",
            title: "Admin Panel",
            active: "panel",
            user: req.user,
            selectedUser,
            selectedUserMessages: selectedUser.messages,
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
