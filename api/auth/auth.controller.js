exports.authLogin = async (req, res, next) => {
    try {
        res.json({ status: 'ok' });
    } catch (e) {
        next(e);
    }    
};

exports.authLogout = (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
}