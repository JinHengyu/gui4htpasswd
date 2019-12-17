// await new Promise(res =>document. addEventListener('DOMContentLoaded', res));
// alert(132)

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
            mime = "application/json",
            parser = null
        } = options;
        app.loading = true;
        const r = await fetch(url, {
            method,
            body,
            headers: new Headers({
                "Content-Type": mime,
                authorization: localStorage.token || ""
            })
        });
        if (!r.ok) {
            app.loading = false;
            throw decodeURIComponent(r.headers.get("error"));
        }
        if (r.headers.get("drop-token")) {
            localStorage.removeItem("token");
            alert("会话凭证已删除，请重新登录");
        }

        let rr = r;
        if (parser === "json") rr = await r.json();
        else if (parser === "blob") rr = await r.blob();
        else if (parser === "text") rr = await r.text();
        // else if (parser === "ndjson") {}
        // else if (parser === "msgpack") {}

        app.loading = false;

        return rr;
    }
};

(async () => {
    try {
        // user对象必须每次从服务端获取
        const { user, version } = await app.fetch("/get/cfg", { parser: "json" });
        app.version.textContent = version;

        app.loading = false;

        if(user){

            app.loginSignup.mainUser = user ;
        }else{
            return
        }
        // if (!user) {
        //     localStorage.removeItem("token");
        //     return;
        // }
        const htpasswd = await app.fetch("/get/list", { parser: "text" });

        app.htpasswd.list = htpasswd
            .split("\n")
            .filter(l => l)
            .map(id => ({ id }));
        app.loading = false;
    } catch (err) {
        alert(err.message || err);
        app.loading = false;
    }
})();
