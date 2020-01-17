module.exports = {
    async json(req, res) {
        const body = [];
        let length = 0;
        const contentLength = +req.headers["content-length"];
        // console.log("len: ", contentLength);
        req.body = await new Promise((resolve, reject) => {
            // 是否执行过onEnd
            let ended = false;
            function onEnd() {
                if (!ended) {
                    resolve(JSON.parse(Buffer.concat(body).toString()));
                    ended = true;
                }
            }

            req.on("data", chunk => {
                body.push(chunk);
                length += chunk.length;
                if (length >= contentLength) onEnd();
            })
                .on("end", onEnd)
                .on("close", onEnd)
                .on("error", (err) => {
                    reject(err);
                });
        });
    },

    async text(req, res) {
        const body = [];
        let length = 0;
        const contentLength = +req.headers["content-length"];
        req.body = await new Promise((resolve, reject) => {
            let ended = false;
            function onEnd() {
                if (!ended) {
                    resolve(Buffer.concat(body).toString());
                    ended = true;
                }
            }

            req.on("data", chunk => {
                body.push(chunk);
                length += chunk.length;
                if (length >= contentLength) onEnd();
            })
                .on("end", onEnd)
                // .on("close", onEnd)
                .on("error", () => {
                    reject(err);
                });
        });
    }
};
