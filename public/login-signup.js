const shadowId = Symbol();
// 主要data是user对象
const dataId = Symbol();
// main user:登录的用户
const mainUserId = Symbol();
const domId = Symbol();
// 登录&添加用户（注册）合二为一

export default class extends window.HTMLElement {
    constructor(list = []) {
        super();
        const _this = this;

        this[dataId] = {
            id: "",
            pwd: ""
        };
        this[shadowId] = this.attachShadow({ mode: "closed" });

        // 按钮样式模拟Google
        this[shadowId].innerHTML = `<div>
 
              
      <style>
        section{
          width: 100px;
          display: inline-block;
        }

        button{
          background-color: #f2f2f2;
          border: 1px solid #f2f2f2;
          border-radius: 4px;
          color: #5F6368;
          font-family: arial,sans-serif;
          font-size: 14px;
          margin: 11px 4px;
          padding: 0 16px;
          line-height: 27px;
          height: 36px;
          text-align: center;
          cursor: pointer;
        }

        button:hover{
          box-shadow: 0 1px 1px rgba(0,0,0,0.1);
          background-color: #f8f8f8;
          border: 1px solid #c6c6c6;
          color: #222;
        }
      </style>
        
      <main>
        <section>用户名：</section> <input type="text" id="id">
        <br>
        <section>密码：</section> <input type="password" id="pwd">
        <br>
        <button id="signup">添加用户</button>
        <button id="log">登录</button>
      </main>
      
       </div>`;

        this[domId] = {
            id: _this[shadowId].querySelector("#id"),
            pwd: _this[shadowId].querySelector("#pwd"),
            log: _this[shadowId].querySelector("#log"),
            signup: _this[shadowId].querySelector("#signup")
        };

        // 双向绑定
        this[domId].id.oninput = async event => (_this[dataId].id = event.target.value);
        this[domId].pwd.oninput = async event => (_this[dataId].pwd = event.target.value);
        this[domId].signup.onclick = async event => {
            _this.addUser({ id: _this[dataId].id, pwd: _this[dataId].pwd }).catch(err => {
                window.alert(err.message || err);
            });
        };

        _this.mainUser = null;
    }

    set mainUser(user) {
        const _this = this;
        _this[mainUserId] = user;
        if (!user) {
            _this[domId].log.innerHTML = "登录";
            _this[domId].log.onclick = async event => {
                _this.login({ id: _this[dataId].id, pwd: _this[dataId].pwd }).catch(err => {
                    window.alert(err.message || err);
                });
            };
        } else {
            _this[domId].log.innerHTML = `登出（${user.id}）`;
            _this[domId].log.onclick = async event => {
                window.localStorage.removeItem("token");
                window.location.reload();
            };
        }
    }

    get mainUser() {
        return this[mainUserId];
    }

    set user({ id, pwd }) {
        this[dataId] = { id, pwd };

        this[shadowId].querySelector("#id").value = id;
        this[shadowId].querySelector("#pwd").value = pwd;
    }

    // 当前输入的user
    get user() {
        return this[dataId];
    }

    async addUser({ id, pwd }) {
        id = id.trim();
        pwd = pwd.trim();
        if (!id || !pwd) throw "用户名或密码为空";
        if (app.htpasswd.list.find(u => u.id === id)) throw `${id} 已经存在`;

        app.loading = true;
        const newUser = await app.fetch("/add/user", {
            body: JSON.stringify({ id, pwd }),
            mime: "application/json",
            parser: "json"
        });

        window.app.htpasswd.list = app.htpasswd.list.concat({ id });

        // const newUser = await res.json()
        app.loading = false;
    }

    async login({ id, pwd }) {
        id = id.trim();
        pwd = pwd.trim();
        if (!id || !pwd) throw "用户名或密码为空";

        const token = await app.fetch("/add/login", {
            body: JSON.stringify({ id, pwd }),
            mime: "application/json",
            parser: "text"
        });

        localStorage.token = token;

        location.reload();
    }
}
