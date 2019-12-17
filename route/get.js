const path = require("path");
const fs = require("fs");
// const jwt = require("jsonwebtoken");
const lineReader = require("../tools/lineReader.js");
const { Transform } = require("stream");

module.exports = async (req, res) => {
    req.paths.shift();

    // 静态文件
    if (req.paths[0] === "public") {
        // if(!req.paths[1])throw '无法请求目录：public'
        absPath = path.join(__dirname, "../public/", req.paths.slice(1).join("/"));

        await new Promise((resolve, reject) => {
            res.writeHead(200, {
                "Content-Type":
                    {
                        html: "text/html",
                        js: "text/javascript",
                        css: "text/css",
                        ico: "image/ico"
                    }[req.paths[req.paths.length - 1].split(".").reverse()[0]] || "",
                "Cache-Control": `public, max-age=${cfg.cacheInSec}`
            });

            r = fs.createReadStream(absPath);
            r.pipe(res.stream);
            r.on("error", err => {
                // console.log(err.code)
                if (err.code === "ENOENT") reject("没有发现文件：" + req.paths.slice(1).join("/"));
                else reject("文件系统错误：" + err.message);
                // res.stream.end();
                reject(err);
            });
            r.on("end", () => {
                res.stream.end();
                resolve();
            });
        });
    } else if (req.paths[0] === "list") {
        if (!req.session.user) throw "没登录";

        await new Promise((resolve, reject) => {
            r = fs.createReadStream(cfg.htpasswd);
            nameBeforeColon = new Transform({
                transform(chunk, encoding, next) {
                    // console.log('hello',chunk,'    ',typeof chunk)
                    this.push(chunk.toString().split(":")[0] + "\n");
                    next();
                }
            });

            r.pipe(new lineReader())
                .pipe(nameBeforeColon)
                .pipe(res.stream);
            r.on("error", err => {
                if (err.code === "ENOENT") reject("没有发现htpasswd文件：" + cfg.htpasswd);
                else reject("文件系统错误：" + err.message);
                reject(err);
            });
            r.on("end", () => {
                res.stream.end();
                resolve();
            });
        });
    } else if (req.paths[0] === "cfg") {
        // let user = "";

        // authorization = req.headers["authorization"];

        // if (!authorization) {
        //     res.json({ user });

        //     return;
        // }

        // try {
        //     user = jwt.verify(authorization, cfg.jwtSecret).user;
        // } catch (err) {
        //     res.json({ user: "" });
        //     return;
        // }

        res.json({
            user: req.session.user || null,
            version: cfg.version
        });
    } else throw "找不到资源：" + req.url;
};
