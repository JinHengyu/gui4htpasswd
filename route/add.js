// const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const matchPwdAndHash = require('../tools/matchPwdAndHash.js')
const lineReader = require('../tools/lineReader.js')
const jwt = require('jsonwebtoken');
const jwtCheck = require('../tools/jwtCheck.js')


module.exports = async (req, res) => {



    req.paths.shift();

    await new Promise(resolve => bodyParser.json()(req, res, resolve))
    // console.log(req.body)
    if (req.paths[0] === 'user') {

        let { id, pwd } = req.body

        jwtCheck(req)


        id = id.trim();
        pwd = pwd.trim();
        if (!id || !pwd) throw '用户名或密码为空'

        if (id !== encodeURIComponent(id)) {
            throw `【${id}】用户名不能包含非uri安全的字符`;
        }

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



    else if (req.paths[0] === 'login') {

        const { id, pwd } = req.body


        hash = await new Promise((resolve, reject) => {

            r =
                fs.createReadStream(cfg.htpasswd)
            r.pipe(new lineReader()).on('data', line => {
                const [idid, hash] = line.split(':')
                if (idid === id) {
                    resolve(hash)
                    r.destroy()
                    return
                }
            })
            r.on('end',e=>{
                reject('用户名不存在')
            })
            r.on('error', err => reject(err))
        })



        if(matchPwdAndHash(pwd,hash)){
            res.end(jwt.sign({
                // 1h
                exp: ~~(Date.now() / 1000) + (60 * 60),
                user: {id}
              }, cfg.jwtSecret))
        }else{
            throw '密码错误'
        }




    }
    else throw '找不到资源：' + req.url

}