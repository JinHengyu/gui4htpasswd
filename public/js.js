
// 模拟vue，app对象存放根组件的数据和方法
window.app = {
    loginSignup: document.querySelector('login-signup'),
    htpasswd: document.querySelector('htpasswd-list'),


    async    fetch(url, options = {}) {
        const { method = 'POST',
            body = undefined,
            // bodyParser
            mime = 'application/json'
            , parser = 'blob' } = options
        const r = await fetch(url, {
            method,
            body,
            headers: new Headers({
                'Content-Type': mime
                ,
                authorization: localStorage.token || ''
            }),

        })
        if (!r.ok) throw decodeURIComponent(r.headers.get('error'))


        if (parser === 'blob') return await r.blob();
        else if (parser === 'json') return await r.json();
        else if (parser === 'text') return await r.text();
        else return await r.blob();
    }


};



(async () => {
    try {

        const { user } = JSON.parse(await (await app.fetch('/get/cfg')).text())

        // console.log(123,user)

        app.loginSignup.mainUser = user || null
        if (!user) {
            localStorage.removeItem('token')
            return
        }
        app.htpasswd.loading = true;
        const htpasswd = await app.fetch('/get/list', { parser: 'text' })

        // const htpasswdList = document.querySelector('htpasswd-list')
        app.htpasswd.list =
            htpasswd.split('\n').filter(l => l).map(line => ({
                id: line.split(':')[0]
            }));
        app.htpasswd.loading = false;






    } catch (err) {
        alert(err.message || err)
        app.htpasswd.loading = false;


    }

})();