const { Transform } = require("stream");

module.exports = class extends Transform {
    constructor(options = {}) {
        super({
            // 写入方向
            writableObjectMode: false,
            // 读出方向
            readableObjectMode: true
        });
        this.queue = "";
        // end of line，最后一行不写
        this.eol = options.eol || "";
    }

    _transform(chunk, encoding, next) {
        this.queue += chunk.toString();

        const lines = this.queue.split("\n");

        this.queue = lines.pop();

        lines.forEach(line => this.push(line + this.eol));

        // backpressure?
        next();
    }
    // 最后一个chunk结束后
    _flush(callback) {
        this.queue.split("\n").forEach(line => {
            this.push(line);
        });
        callback();
    }
};
