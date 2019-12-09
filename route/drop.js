const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')
// const crypto = require('crypto')
const jwtCheck = require('../tools/jwtCheck.js')


module.exports = async (req, res) => {
    req.paths.shift();
    await new Promise(resolve => bodyParser.json()(req, res, resolve))


    if (req.paths[0] === 'user') {

        let { id } = req.body;

        jwtCheck(req)

        const ms2wait = cfg.drop_last + cfg.drop_interval - Date.now();
        if (ms2wait >= 0) throw `删除过于频繁, 再等待 ${~~(ms2wait / 1000)} 秒`

        const htpasswdRaw = await new Promise((resolve, reject) => {
            fs.readFile(cfg.htpasswd,'utf-8', (err, data) => {
                if (err) reject(err)
                else resolve(data.toString())
            })

        })


        const users = htpasswdRaw.split('\n').reduce((users, line) => {
            const args = line.split(':', 3)
            // 去除空白行，去除重名
            if (args.length > 1) users[args[0]] = args[1];
            return users;
        }, {})



        delete users[id];

        await new Promise((resolve, reject) => {
            htpasswd2write = Object.entries(users).map(([id, pwd]) => id + ':' + pwd).join('\n');
            // console.log(htpasswd2write)
            fs.writeFile(cfg.htpasswd, htpasswd2write, (err) => { 
                if (err) reject(err)
                else resolve()
            });

        })

        
        
        
        
        
        
        
        cfg.drop_last = Date.now();
        
        res.end({id});


    }





    else throw '找不到资源：' + req.url

}