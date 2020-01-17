"use strict";

const $shadow = Symbol();
// 表单对应的human对象
const $human = Symbol();
//  登录的用户
const $user = Symbol();
const $dom = Symbol();
// 登录&添加用户（注册）合二为一

export default class extends window.HTMLElement {
    constructor(list = []) {
        super();
        const _this = this;

        // (null).test;

        this[$shadow] = this.attachShadow({ mode: "closed" });

        // 按钮样式模拟Google
        this[$shadow].innerHTML = `<div>
 
              
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
        <button id="log">登录/登出</button>
      </main>
      
       </div>`;
    }

    connectedCallback() {
        const _this = this;

        this[$human] = {
            id: "",
            pwd: ""
        };

        this[$dom] = {
            id: _this[$shadow].querySelector("#id"),
            pwd: _this[$shadow].querySelector("#pwd"),
            log: _this[$shadow].querySelector("#log"),
            signup: _this[$shadow].querySelector("#signup")
        };

        // 双向绑定
        this[$dom].id.oninput = async event => (_this[$human].id = event.target.value);
        this[$dom].pwd.oninput = async event => (_this[$human].pwd = event.target.value);
        this[$dom].signup.onclick = async event => {
            _this.addHuman({ id: _this[$human].id, pwd: _this[$human].pwd }).catch(err => {
                window.alert(err.message || err);
            });
        };

        this.user = null;
    }

    set user(user) {
        const _this = this;
        _this[$user] = user;
        if (!user) {
            // console.log(_this[$dom].log)
            _this[$dom].log.innerHTML = "登录";
            _this[$dom].log.onclick = async event => {
                _this.login({ id: _this[$human].id, pwd: _this[$human].pwd }).catch(err => {
                    window.alert(err.message || err);
                });
            };
        } else {
            _this[$dom].log.innerHTML = `登出（${user.id}）`;
            _this[$dom].log.onclick = async event => {
                window.localStorage.removeItem("token");
                window.location.reload();
            };
        }
    }

    get user() {
        return this[$user];
    }

    set human({ id, pwd }) {
        this[$human] = { id, pwd };

        this[$dom].id.value = id;
        this[$dom].pwd.value = pwd;
    }

    // 当前输入的human
    get human() {
        return this[$human];
    }

    async addHuman({ id, pwd }) {
        id = id.trim();
        // pwd = pwd.trim();
        if (!id || !pwd) throw "用户名或密码为空";
        if (app.htpasswd.list.find(u => u.id === id)) throw `${id} 已经存在`;

        // app.loading = true;
        const newHuman = await app.fetch("/add/user", {
            body: JSON.stringify({ id, pwd }),
            reqMime: "application/json",
            parser: "json"
        });

        window.app.htpasswd.list = app.htpasswd.list.concat({ id });

        app.loading = false;
    }

    async login({ id, pwd }) {
        id = id.trim();
        // pwd = pwd.trim();
        if (!id || !pwd) throw "用户名或密码为空";

        const token = await app.fetch("/add/login", {
            body: JSON.stringify({ id, pwd }),
            reqMime: "application/json",
            parser: "text"
        });

        localStorage.token = token;

        location.reload();
    }
}
