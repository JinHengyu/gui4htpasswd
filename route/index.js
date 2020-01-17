const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const log = require("../tools/log.js");

// Compatibility API
module.exports = async (req, res) => {
    try {
        // false
        // console.log(123,req.stream.isPaused())

        req.session = "";
        const authorization = req.headers["authorization"];
        if (authorization) {
            try {
                // jwt标准格式（exp，iat。。。）
                req.session = jwt.verify(authorization, cfg.appName);
                // return req.session;
            } catch (err) {
                // https://www.npmjs.com/package/jsonwebtoken#errors--codes
                if (err.name === "TokenExpiredError") {
                    // to be sent
                    res.setHeader("-drop-token", 1);
                } else if (err.name === "JsonWebTokenError") throw "凭证损坏：" + err.message;
                else if (err.name === "NotBeforeError") throw "Not Before 错误：" + err.message;
            }
        }

        // 路由表
        req.paths = req.url.split("/").filter(p => p.trim());

        // 根路由
        if (req.paths.length === 0) {
            await new Promise((resolve, reject) => {
                res.setHeader("Content-Type", "text/html");

                const r = fs.createReadStream(path.join(__dirname, "../public/index.html"));
                r.on("error", err => {
                    //    if (err.code === "ENOENT") reject("网站挂啦，连index.html都找不到了");
                    //    else reject("文件系统错误：" + err.message);
                    reject(err);
                });
                r.on("end", () => {
                    // res.end();
                    resolve();
                });
                r.pipe(res);
            });
        }
        // 二级路由们
        else if (req.paths[0] === "get") await require(path.join(__dirname, "./get.js"))(req, res);
        else if (req.paths[0] === "add") await require(path.join(__dirname, "./add.js"))(req, res);
        else if (req.paths[0] === "drop") await require(path.join(__dirname, "./drop.js"))(req, res);
        else throw "找不到资源：" + req.url;
    } catch (err) {
        const message = err.message || err || "有内鬼，终止交易";

        if (res.headersSent) {
            await log.add(message); // write to log.md
        } else {
            res.writeHead(400, {
                "Content-Type": "text/html; charset=utf-8",
                "-error": encodeURIComponent(message)
            });
            // The first time response.write() is called, it will send the buffered header information and the first chunk of the body to the client
            // console.log("hello", message);
            res.end(`<h1>${message}</h1>`);
            // res.end();
        }
    }
};
