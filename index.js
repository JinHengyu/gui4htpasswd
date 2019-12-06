const fs = require('fs')
const path = require('path')
const http2 = require('http2')


global.cfg = require('./cfg.js')

//创建HTTP2服务器
const server = http2.createSecureServer({
    cert: fs.readFileSync(path.join(__dirname, './ssl/bsh.cer')),
    key: fs.readFileSync(path.join(__dirname, './ssl/bsh.key')),
}, onRequest)

// Request 事件
async function onRequest(req, res) {


    try {
        req.paths = req.url.slice(1).split('/')

        // 入口
        if (req.paths[0] === '' && req.paths.length === 1) {

            await new Promise((resolve, reject) => {
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                })

                r = fs.createReadStream('./public/index.html')
                r.pipe(res.stream)
                r.on('error', err => {
                    if (err.code === 'ENOENT') reject('网站挂啦，连index.html都找不到了')
                    else reject('文件系统错误：' + err.message)
                    reject(err)
                })
                r.on('end', () => {
                    res.stream.end();
                    resolve()
                });

            })


        }

        else if (req.paths[0] === 'get') await require('./route/get.js')(req, res);
        else if (req.paths[0] === 'add') await require('./route/add.js')(req, res);




        else throw '找不到资源：' + req.url
    } catch (err) {
        message = err.message || err || '发生了未知错误'
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8', 'error': encodeURIComponent(message) });
        res.stream.write(`<h1>${message}</h1>`)
        res.end();
    }


}
server.listen(8080)
console.log('https://localhost:8080')