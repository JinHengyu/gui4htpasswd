

window.app = {
    formId: document.querySelector('section #id'),
    formPwd: document.querySelector('section #pwd'),
    htpasswd: document.querySelector('htpasswd-list')
    ,

    async  addUser({ id, pwd }) {
        try {
            id = id.trim();
            pwd = pwd.trim();
            if (!id || !pwd) throw '用户名或密码为空'
            if (app.htpasswd.list.find(u => u.id === id)) throw `${id} 已经存在`


            const res = await fetch('/add/user', {
                method: 'POST',
                body: JSON.stringify({ id, pwd }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })
            if (!res.ok) throw decodeURIComponent(res.headers.get('error'))
            app.htpasswd.list = app.htpasswd.list.concat({ id })

            const newUser = await res.json()

        } catch (err) {
            alert(err.message || err)
            console.log(123)
        }
    },


    async  dropUser({ id }) {
        try {




        } catch (err) {
            alert(err.message || err)
        }
    }


};



(async () => {
    try {

        app.htpasswd.loading = true;
        const r = await fetch('/get/list')
        if (!r.ok) {
            throw decodeURIComponent(r.headers.get('error'))
        }

        const htpasswd = await r.text();

        const htpasswdList = document.querySelector('htpasswd-list')
        htpasswdList.list =
            htpasswd.split('\n').filter(l => l).map(line => ({
                id: line.split(':')[0]
            }));
        app.htpasswd.loading = false;

        // ul.addEventListener('click', async event => {
        //     try {

        //         if (event.target.tagName.toLowercase() !== 'button') return

        //         userId = event.target.parentNode.getAttribute('data-userId')
        //         if (!userId) return;
        //         await dropUser({ id: userId });
        //         alert(`${userId} 删除成功`)
        //     } catch (err) {
        //         alert(err.message || err)

        //     }

        // })


    } catch (err) {
        alert(err.message || err)

    }

})();