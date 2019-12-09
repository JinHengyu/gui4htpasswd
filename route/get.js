const path = require('path')
const fs = require('fs')
// const jwtCheck = require('../tools/jwtCheck.js')
const jwt = require('jsonwebtoken');


module.exports = async (req, res) => {
    // req.subUrl = req.subUrl.replace(/^\/get\//,'')
    req.paths.shift();



    // 静态文件
    if (req.paths[0] === 'public') {
        // if(!req.paths[1])throw '无法请求目录：public'
        absPath = path.join(__dirname, '../public/', req.paths.slice(1).join('/'))

        await new Promise((resolve, reject) => {
            res.writeHead(200, {
                'Content-Type': {
                    'html': 'text/html',
                    'js': 'text/javascript',
                    'css': 'text/css',
                    'ico': 'image/ico'
                }[req.paths[req.paths.length - 1].split('.').reverse()[0]] || ''
            })

            r = fs.createReadStream(absPath)
            r.pipe(res.stream)
            r.on('error', err => {
                // console.log(err.code)
                if (err.code === 'ENOENT') reject('没有发现文件：' + req.paths.slice(1).join('/'))
                else reject('文件系统错误：' + err.message)
                // res.stream.end();
                reject(err)
            })
            r.on('end', () => {
                res.stream.end();
                resolve()
            });

        })





    } else if (req.paths[0] === 'list') {
        await new Promise((resolve, reject) => {
            r = fs.createReadStream(cfg.htpasswd)
            r.pipe(res.stream)
            r.on('error', err => {
                if (err.code === 'ENOENT') reject('没有发现htpasswd文件：' + cfg.htpasswd)
                else reject('文件系统错误：' + err.message)
                reject(err)
            })
            r.on('end', () => {
                res.stream.end();
                resolve()
            });

        })

    }


    else if (req.paths[0] === 'cfg') {


        // falsy的user提示前端删除token
        let user = '';



        authorization = req.headers['authorization']

        if (!authorization) {

            res.json({ user })

            return
        }



        try {
            user = jwt.verify(authorization, cfg.jwtSecret).user;
        } catch (err) {
            res.json({ user: '' })
            return
        }




        res.json(
            {
                user
            }


        )

    }



    else throw '找不到资源：' + req.url

}