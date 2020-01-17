// document.body.appendChild(document.createElement('login-signup'))

"use strict";

// await new Promise(res =>document. addEventListener('DOMContentLoaded', res));

// 模拟vue，app对象存放根组件的数据和方法
window.app = {
    loginSignup: document.querySelector("login-signup"),
    htpasswd: document.querySelector("htpasswd-list"),
    loadingEl: document.querySelector("#loading"),
    version: document.querySelector("#version"),

    set loading(bool = true) {
        if (bool) {
            app.loadingEl.style.display = "block";
        } else {
            app.loadingEl.style.display = "none";
        }
    },

    async fetch(url, options = {}) {
        const {
            method = "POST",
            body = undefined,
            // bodyParser
            reqMime = "application/json",
            parser = null
        } = options;
        app.loading = true;
        const r = await fetch(url, {
            method,
            body,
            headers: new Headers({
                "Content-Type": reqMime,
                authorization: localStorage.token || ""
            })
        });
        const errorMessage = r.headers.get("-error");
        const resMime = r.headers.get("Content-Type");
        const dropToken = r.headers.get("-drop-token");

        if (!r.ok || errorMessage) {
            app.loading = false;
            throw decodeURIComponent(errorMessage || "有内鬼，终止进程");
        }
        if (dropToken) {
            localStorage.removeItem("token");
            alert("会话凭证已删除，请重新登录");
        }

        let rr = r;
        // if (parser === "json") rr = await r.json();
        // else if (parser === "blob") rr = await r.blob();
        // else if (parser === "text") rr = await r.text();

        // 优先级：parser大于mime
        if (parser) {
            rr = await {
                json: () => r.json(),
                blob: () => r.blob(),
                text: () => r.text(),
                ndjson() {},
                msp() {},
                default: () => r
            }[parser || "default"]();
        } else if (resMime) {
            rr = await {
                "application/json": () => r.json(),
                "application/octet-stream": () => r.blob(),
                "text/plain": () => r.text(),
                "application/x-ndjson": () => r.text(),
                default: () => r
            }[
                resMime
                    .split(";")[0]
                    .trim()
                    .toLowerCase() || "default"
            ]();
        } else {
            rr = await r.arrayBuffer();
        }

        app.loading = false;

        return rr;
    }
};

(async () => {
    // user对象必须每次从服务端获取
    const { user, version } = await app.fetch("/get/cfg", { parser: "json" });
    app.version.textContent = version;

    app.loading = false;

    console.log("后台日志地址：", location.href + "/get/public/logs");
    if (user) {
        app.loginSignup.user = user;
    } else {
        return;
    }

    const htpasswd = await app.fetch("/get/list", { parser: "text" });
    // console.log(123,htpasswd)
    app.htpasswd.list = htpasswd
        .split("\n")
        .filter(l => l)
        .map(id => ({ id }));
})().catch(err => {
    alert(err.message || err);
    app.loading = false;
});
