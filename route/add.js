// const bodyParser = require("body-parser");
const fs = require("fs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bodyParser = require("../tools/bodyParser.js");
const matchPwdAndHash = require("../tools/matchPwdAndHash.js");
const lineReader = require("../tools/lineReader.js");
const log = require("../tools/log.js");

module.exports = async (req, res) => {
    req.paths.shift();

    // await new Promise(resolve => bodyParser.json()(req, res, resolve));
    await bodyParser.json(req, res);
    //
    if (req.paths[0] === "user") {
        let { id, pwd } = req.body;

        // jwtCheck(req)
        if (!req.session.user) throw `请登录`;

        id = id.trim();
        // pwd = pwd.trim();
        if (!id || !pwd) throw "用户名或密码为空";

        if (id !== encodeURIComponent(id)) {
            throw `${id}包含了非URI安全的字符`;
        }

        const newLine =
            "\n" +
            id +
            ":{SHA}" +
            crypto
                .createHash("sha1")
                .update(pwd, "utf8")
                .digest("base64");

        await new Promise((resolve, reject) => {
            fs.appendFile(cfg.htpasswd, newLine, err => {
                if (err) reject(err);
                else resolve();
            });
        });

        log.add(`${req.session.user.id}添加了${id}`);
        res.json({ id, pwd });
        // res.end();
    }

    // entry point
    else if (req.paths[0] === "login") {
        const { id, pwd } = req.body;

      const  hash = await new Promise((resolve, reject) => {
            let lineIndex = 1;
            let found = false;
            const r = fs.createReadStream(cfg.htpasswd, "utf-8");
            r.pipe(new lineReader()).on("data", line => {
                lineIndex++;
                if (lineIndex > cfg.maxLines) {
                    r.destroy();
                    reject(`抱歉，verdaccio总用户数量超过了${cfg.maxLines}，请联系管理员修复`);
                }
                const [idid, hash] = line.split(":");
                if (idid === id) {
                    // console.log(line[0])
                    found = true;
                    resolve(hash);
                    r.destroy();
                    return;
                }
            });
            r.on("end", e => {
                if (!found) reject("用户名不存在");
            });
            r.on("error", err => reject(err));
        });

        if (matchPwdAndHash(pwd, hash)) {
            res.setHeader("Content-Type", "text/plain; charset=UTF-8");
            res.end(
                jwt.sign(
                    {
                        exp: ~~(Date.now() / 1000) + cfg.sessionInSec,
                        user: { id, admin: cfg.whiteList.includes(id) }
                    },
                    cfg.appName
                )
            );
            log.add(`${id}登录了`);
        } else {
            throw "密码错误";
        }
    } else throw "找不到资源：" + req.url;
};
