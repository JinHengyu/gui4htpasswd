// const path = require('path')
const lineReader = require("../tools/lineReader.js");
const fs = require("fs");
const bodyParser = require("body-parser");
// const jwtCheck = require("../tools/jwtCheck.js");

module.exports = async (req, res) => {
    req.paths.shift();
    await new Promise(resolve => bodyParser.json()(req, res, resolve));

    if (req.paths[0] === "user") {
        let { id } = req.body;

        if (!req.session.user) throw `请登录`;
        if (!cfg.whiteList.includes(req.session.user.id)) throw `没有权限`;

        const ms2wait = cfg.drop_last + cfg.drop_interval - Date.now();
        if (ms2wait >= 0) throw `编辑用户过于频繁, 请等待 ${~~(ms2wait / 1000)} 秒后重试`;

        // const htpasswdRaw = await new Promise((resolve, reject) => {
        //     fs.readFile(cfg.htpasswd, 'utf-8', (err, data) => {
        //         if (err) reject(err)
        //         else resolve(data.toString())
        //     })

        // })

        const htpasswdLines = await new Promise((resolve, reject) => {
            const lines = [];

            r = fs.createReadStream(cfg.htpasswd, "utf-8");

            r.pipe(new lineReader()).on("data", line => {
                lines.push(line);
                if (lines.length > cfg.maxLines) {
                    r.destroy();

                    reject(`抱歉，verdaccio总用户数量超过了${cfg.maxLines}，请联系管理员修复`);
                }
            });
            r.on("end", e => {
                resolve(lines);
            });
            r.on("error", err => reject(err));
        });

        const users = htpasswdLines.reduce((users, line) => {
            const args = line.split(":", 3);
            // 去除空白行，去除重名
            if (args.length > 1) users[args[0]] = args[1];
            return users;
        }, {});

        if (!users[id]) throw `${id}不存在`;

        delete users[id];

        await new Promise((resolve, reject) => {
            htpasswd2write = Object.entries(users)
                .map(([id, pwd]) => id + ":" + pwd)
                .join("\n");
            // console.log(htpasswd2write)
            fs.writeFile(cfg.htpasswd, htpasswd2write, err => {
                if (err) reject(err);
                else resolve();
            });
        });

        cfg.drop_last = Date.now();

        res.end({ id });
    } else throw "找不到资源：" + req.url;
};
