const jwt = require('jsonwebtoken');

// jwt中间件
module.exports = function (req, res) {

    authorization = req.headers['authorization']
    if (!authorization) throw '未登录'


    let user;

    try {
        user = jwt.verify(authorization, cfg.jwtSecret).user;
    } catch (err) {
        // https://www.npmjs.com/package/jsonwebtoken#errors--codes
        if (err.name === 'TokenExpiredError') throw '登录已过期：' + err.message
        else if (err.name === 'JsonWebTokenError') throw '凭证损坏：' + err.message
    }


    return user

}