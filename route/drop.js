// const path = require('path')
const fs = require("fs");
const lineReader = require("../tools/lineReader.js");
const bodyParser = require("../tools/bodyParser.js");
const log = require("../tools/log.js");

module.exports = async (req, res) => {
    req.paths.shift();
    // await new Promise(resolve => bodyParser.json()(req, res, resolve));

    await bodyParser.json(req, res);

    // {}[req.paths[0]]
    if (req.paths[0] === "user") {
        // console.log("BODY: ", req.body);

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

        const htpasswdLines = await new Promise((resolve, reject) => {
            const lines = [];

            const r = fs.createReadStream(cfg.htpasswd, "utf-8");

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
            const htpasswd2write = Object.entries(users)
                .map(([id, pwd]) => id + ":" + pwd)
                .join("\n");
            // console.log(htpasswd2write)
            fs.writeFile(cfg.htpasswd, htpasswd2write, err => {
                if (err) reject(err);
                else resolve();
            });
        });

        log.add(`${id}被${req.session.user.id}删掉了`);

        cfg.drop_last = Date.now();

        res.json({ id });
    } else throw "找不到资源：" + req.url + "【你他喵是黑客吧】";
};
