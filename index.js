const fs = require("fs");
const path = require("path");
const http2 = require("http2");
const log = require("./tools/log.js");

global.cfg = require("./cfg.js");

// const server = http2.createServer({}, onRequest)

http2
    .createSecureServer(
        {
            cert: fs.readFileSync(path.join(__dirname, "./ssl/localhost.crt")),
            key: fs.readFileSync(path.join(__dirname, "./ssl/localhost.key"))
        },
        // 先序遍历路由树
        require("./route/index.js")
    )
    // .on("error", err => {
    //     console.log(111, err.message);
    // })
    .listen(cfg.port);

http2.Http2ServerResponse.prototype.json = function(obj) {
    //await log.add(`啊呀呀，本想发送${JSON.stringify(obj)}的，结果晚了`);
    if (!this.headersSent) this.writeHead(200, { "Content-Type": "application/json" });

    this.write(JSON.stringify(obj));
    this.end();

    // this.destroy();
};

console.log(`https://localhost:${cfg.port}`);

process.on("uncaughtException", err => {
    // err.message === 'The stream has been destroyed'
    if (err.code === "ERR_HTTP2_INVALID_STREAM") {
        log.add(`stream被销毁啦，是不是有人一直按F5？`);
    }else throw err;
});
