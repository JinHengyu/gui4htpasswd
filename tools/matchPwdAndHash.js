// 摘自：
// https://github.com/verdaccio/verdaccio-htpasswd/blob/0ddbbe8f4454ff0bbfbfdd7db2bce95a34af7397/src/utils.ts




const crypto = require('crypto');
const md5 = require('apache-md5');
const bcrypt = require('bcryptjs');
const crypt = require('unix-crypt-td-js');




function createSalt(type = 'sha512') {
    switch (type) {
        case 'md5':
            return '$1$' + crypto.randomBytes(10).toString('base64');

        case 'blowfish':
            return '$2a$' + crypto.randomBytes(10).toString('base64');

        case 'sha256':
            return '$5$' + crypto.randomBytes(10).toString('base64');

        case 'sha512':
            return '$6$' + crypto.randomBytes(10).toString('base64');

        default:
            throw new TypeError(`Unknown salt type at crypt3.createSalt: ${type}`);
    }
}


function crypt3(
    key,
    salt = createSalt()
) {
    return crypt(key, salt);
}




module.exports = function (passwd, hash) {
    if (hash.match(/^\$2(a|b|y)\$/)) {
        return bcrypt.compareSync(passwd, hash);
    } else if (hash.indexOf('{PLAIN}') === 0) {
        return passwd === hash.substr(7);
    } else if (hash.indexOf('{SHA}') === 0) {
        return (
            crypto
                .createHash('sha1')
                // https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding
                .update(passwd, 'utf8')
                .digest('base64') === hash.substr(5)
        );
    }
    // for backwards compatibility, first check md5 then check crypt3
    return md5(passwd, hash) === hash || crypt3(passwd, hash) === hash;
}