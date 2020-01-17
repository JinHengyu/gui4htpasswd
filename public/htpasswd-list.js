"use strict";

const $shadow = Symbol();
const $list = Symbol();

export default class extends window.HTMLElement {
    constructor(list = []) {
        super();
        const _this = this;

        this[$shadow] = this.attachShadow({ mode: "closed" });

        this[$shadow].innerHTML = `<div>

            <style>
              ul{
                max-width: 400px;
                word-break: break-all;
              }
              ul>li>span{
                min-width: 150px;
                display: inline-block;
              }
              ul>li>button{
                border: none;
                background-color: unset;
                color: rgba(0,0,200,0.9);
                cursor: pointer;
              }
              ul>li>button:hover{
                border-bottom: 1px solid blue;
                color: rgb(0,0,255);
              }
            </style>

            <ul> </ul>
        </div> `;

        // this.list = list;
    }

    connectedCallback() {
        const _this = this;

        this[$shadow].querySelector("ul").addEventListener("click", async event => {
            try {
                if (event.target.tagName.toLowerCase() !== "button") return;

                if (!app.loginSignup.user.admin) throw "您不在白名单内，不能操作用户";

                const humanId = event.target.getAttribute("data-humanId");
                if (event.target.classList.contains("dropHuman")) {
                    if (!confirm(`确定删除${humanId}？`)) return;

                    await _this.dropHuman({ id: humanId });
                    window.alert(`${humanId}已删除`);
                } else if (event.target.classList.contains("resetPwd")) {
                    let newPwd = prompt(`输入${humanId}的新密码：`);
                    if (!newPwd) return;
                    if (newPwd !== prompt(`确认新密码：`)) throw "2次密码不一致";
                    await _this.resetPwd({ id: humanId, pwd: newPwd });
                    alert(`${humanId}的密码修改成功`);
                }
            } catch (err) {
                alert(err.message || err);
                // app.loading = false;
            }
        });

        this.list = [];
    }

    set list(list) {
        this[$list] = list;

        this[$shadow].querySelector("ul").innerHTML = list
            .map(
                ({ id }) =>
                    `<li> <span>${id}</span> 
                        <button data-humanId="${id}" class="dropHuman">删除</button>
                        <button data-humanId="${id}" class="resetPwd">修改密码</button>
                    </li>`
            )
            .join("");
    }

    get list() {
        return this[$list];
    }

    async dropHuman({ id }) {
        // app.loading = true;
        const res = await app.fetch("/drop/user", { body: JSON.stringify({ id }), reqMime: "application/json" });

        app.htpasswd.list = app.htpasswd.list.filter(u => u.id !== id);

        // await res.arrayBuffer()
        app.loading = false;
    }

    async resetPwd({ id, pwd }) {

        await app.fetch("/drop/user", { body: JSON.stringify({ id }) });
        await app.fetch("/add/user", { body: JSON.stringify({ id, pwd }) });

    }
}
