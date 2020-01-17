// const lineReader = require("./lineReader.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    async add(msg) {
        const d = new Date();
        let title;
        // 在间隔之内的日志写在同一个标题下（有点像缓存层）
        if (d - cfg.log_last < cfg.log_interval) {
            title = "";
        } else {
            title = `

---

## Since ${d.toString()}
`;
            cfg.log_last = +d;
        }

        const message = `${title}
+ ${msg}`;

        fs.appendFileSync(path.join(__dirname, `../public/logs/${d.getFullYear()}-${d.getMonth() + 1}.md`), message);
    },
    async clear(line2count = 10) {
        //    删除过时的log
    }
};
