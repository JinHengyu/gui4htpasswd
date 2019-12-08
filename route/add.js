const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')
const crypto = require('crypto')

module.exports = async (req, res) => {



    req.paths.shift();

    await new Promise(resolve => bodyParser.json()(req, res, resolve))
    // console.log(req.body)
    if (req.paths[0] === 'user') {

        let { id, pwd } = req.body

        id = id.trim();
        pwd = pwd.trim();
        if (!id || !pwd) throw '用户名或密码为空'

        if (id !== encodeURIComponent(id)) {
            throw `【${id}】用户名不能包含非uri安全的字符`;
        }

        // console.log('hell')
        // function sha1(text) {
        //     let generator = crypto.createHash('sha1');
        //     generator.update(text);
        //     return generator.digest('hex');
        // }


        const newLine = '\n' + req.body.id + ':' + '{SHA}' +
            crypto
                .createHash('sha1')
                .update(pwd, 'utf8')
                .digest('base64');;


        await new Promise((resolve, reject) => {
            fs.appendFile(cfg.htpasswd, newLine, err => {
                if (err) reject(err);
                else resolve();
            })
        })


        res.stream.write(JSON.stringify(req.body))
        res.end();



    }
    else throw '找不到资源：' + req.url

}