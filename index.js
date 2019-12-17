const fs = require("fs");
const path = require("path");
const http2 = require("http2");
const jwt = require("jsonwebtoken");

global.cfg = require("./cfg.js");

//创建HTTP2服务器
// const server = http2.createServer({}, onRequest)

http2
    .createSecureServer(
        {
            cert: fs.readFileSync(path.join(__dirname, "./ssl/localhost.crt")),
            key: fs.readFileSync(path.join(__dirname, "./ssl/localhost.key"))
        },

        async function(req, res) {
            try {
                // jwtCheck(req);

                req.session = "";
                authorization = req.headers["authorization"];
                if (authorization) {
                    try {
                        // jwt标准格式（exp，iat。。。）
                        req.session = jwt.verify(authorization, cfg.jwtSecret);
                        // console.log(req.session)
                        // return req.session;
                    } catch (err) {
                        // https://www.npmjs.com/package/jsonwebtoken#errors--codes
                        if (err.name === "TokenExpiredError") {
                            // throw "凭证已过期，请重新登录"
                            res.setHeader("drop-token", 1);
                        } else if (err.name === "JsonWebTokenError") throw "凭证损坏：" + err.message;
                        else if (err.name === "NotBeforeError") throw "not before 错误：" + err.message;
                    }
                }

                req.paths = req.url.slice(1).split("/");

                // 根路由
                if (req.paths[0] === "" && req.paths.length === 1) {
                    await new Promise((resolve, reject) => {
                        res.writeHead(200, {
                            "Content-Type": "text/html"
                        });

                        r = fs.createReadStream(path.join(__dirname, "./public/index.html"));
                        r.pipe(res.stream);
                        r.on("error", err => {
                            if (err.code === "ENOENT") reject("网站挂啦，连index.html都找不到了");
                            else reject("文件系统错误：" + err.message);
                            reject(err);
                        });
                        r.on("end", () => {
                            res.stream.end();
                            resolve();
                        });
                    });
                } else if (req.paths[0] === "get") await require(path.join(__dirname, "./route/get.js"))(req, res);
                else if (req.paths[0] === "add") await require(path.join(__dirname, "./route/add.js"))(req, res);
                else if (req.paths[0] === "drop") await require(path.join(__dirname, "./route/drop.js"))(req, res);
                else throw "找不到资源：" + req.url;
            } catch (err) {
                message = err.message || err || "有内鬼，终止交易";
                res.writeHead(400, {
                    "Content-Type": "text/html; charset=utf-8",
                    error: encodeURIComponent(message)
                });
                res.stream.write(`<h1>${message}</h1>`);
                res.end();
            }
        }
    )
    .listen(cfg.port);

console.log(`https://localhost:${cfg.port}`);

http2.Http2ServerResponse.prototype.json = function(obj) {
    // this.statusCode=200;
    this.writeHead(200, { "Content-Type": "application/json" });
    this.write(JSON.stringify(obj));
    this.end();
};
