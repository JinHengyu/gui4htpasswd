"use strict";

const path = require("path");
const fs = require("fs");
const { Transform, Readable } = require("stream");
const lineReader = require("../tools/lineReader.js");
const log = require("../tools/log.js");

module.exports = async (req, res) => {
    // true
    // console.log('req.stream和res.stream是同一个吗：',req.stream===res.stream)

    req.paths.shift();

    // 静态文件
    if (req.paths[0] === "public") {
        // if(!req.paths[1])throw '无法请求目录：public'

        const absPath = path.join(__dirname, "../public/", ...req.paths.slice(1));
        const isFile = await new Promise((resolve, reject) => {
            fs.stat(absPath, (err, stats) => {
                // 可能错误： ENOENT: no such file or directory, stat 'D:\GitLab\verdaccio-admin\public\js.js2'
                if (err) reject(err);
                else if (stats.isFile()) resolve(true);
                else if (stats.isDirectory()) resolve(false);
                else reject(`${req.url}既不是文件也不是文件夹！`);
            });
        });

        const suffix = isFile ? path.extname(req.url) : "directory";
        res.setHeader(
            "Content-Type",
            {
                ".html": "text/html",
                ".js": "text/javascript; charset=UTF-8",
                ".css": "text/css",
                ".ico": "image/ico",
                ".md": "text/plain; charset=UTF-8",
                directory: "text/plain; charset=UTF-8"
            }[suffix] || "application/octet-stream"
        );
        res.setHeader("Cache-Control", `public, max-age=${cfg.cacheInSec}`);
        res.setHeader("ETag", cfg.version);

        let r;
        if (isFile) {
            r = fs.createReadStream(absPath);
        } else {
            r = new Readable({
                read() {}
            });
            fs.readdirSync(absPath)
                .map(name => path.join("get", ...req.paths, name))
                .forEach(pa => {
                    r.push(pa + "\n");
                });
            r.push(null);
        }
        if (!res.headerSent) res.writeHead();

        await new Promise((resolve, reject) => {
            r.on("error", err => {
                // if (err.code === "ENOENT") reject("没有发现文件：" + req.paths.slice(1).join("/"));
                // else reject("文件系统错误：" + err.message);

                // log.append(err.message || err);
                reject(err);

                // res.destroy();
            });
            r.on("end", () => {
                // res.end();
                resolve();
            });
            r.pipe(res);
        });
    } else if (req.paths[0] === "list") {
        if (!req.session.user) throw "没登录";

        const r = fs.createReadStream(cfg.htpasswd);
        const nameBeforeColon = new Transform({
            transform(chunk, encoding, next) {
                // console.log('hello',chunk,'    ',typeof chunk)
                this.push(chunk.toString().split(":")[0] + "\n");
                next();
            }
        });

        await new Promise((resolve, reject) => {
            r.on("error", err => {
                // if (err.code === "ENOENT") reject("没有发现htpasswd文件：" + cfg.htpasswd);

                log.add(err.message || err);
                reject(err);
            });
            r.on("end", () => {
                // r结束了但res还没有立即结束（异步）
                // res.end();
                resolve();
            });
            r.pipe(new lineReader())
                .pipe(nameBeforeColon)
                .pipe(res);
        });
    } else if (req.paths[0] === "cfg") {
        res.json({
            user: req.session.user || null,
            version: cfg.version
        });
    } else throw "找不到资源：" + req.url;
};
