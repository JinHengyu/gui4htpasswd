const shadowId = Symbol();
const dataKey = Symbol();

export default class extends window.HTMLElement {
    constructor(list = []) {
        super();
        const _this = this;

        this[shadowId] = this.attachShadow({ mode: "closed" });

        this[shadowId].innerHTML = `<div>

            <style>
              ul>li>span{
                width:200px;
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

        this[shadowId].querySelector("ul").addEventListener("click", async event => {
            try {
                if (event.target.tagName.toLowerCase() !== "button") return;

                if (!app.loginSignup.mainUser.admin) throw "您不在白名单内，不能操作用户";

                const userId = event.target.getAttribute("data-userId");
                if (event.target.classList.contains("dropUser")) {
                    if (!confirm(`确定删除${userId}？`)) return;

                    await _this.dropUser({ id: userId });
                    window.alert(`${userId}已删除`);
                } else if (event.target.classList.contains("resetPwd")) {
                   let newPwd = prompt(`输入${userId}的新密码：`);
                    if (!newPwd) return;
                    if (newPwd !== prompt(`确认新密码：`)) throw "2次密码不一致";
                    await _this.resetPwd({ id: userId, pwd: newPwd });
                    alert(`${userId}的密码修改成功`);
                }
            } catch (err) {
                alert(err.message || err);
                // app.loading = false;
            }
        });

        this.list = list;
    }

    set list(list) {
        this[dataKey] = list;

        this[shadowId].querySelector("ul").innerHTML = `
                ${list
                    .map(
                        ({ id }) => ` <li> <span>${id}</span> 
                            <button data-userId="${id}" class="dropUser">删除</button>
                            <button data-userId="${id}" class="resetPwd">修改密码</button>
                        </li> `
                    )
                    .join("")}
             `;
    }

    get list() {
        return this[dataKey];
    }

    async dropUser({ id }) {
        app.loading = true;
        const res = await app.fetch("/drop/user", { body: JSON.stringify({ id }), mime: "application/json" });

        app.htpasswd.list = app.htpasswd.list.filter(u => u.id !== id);

        // await res.arrayBuffer()
        app.loading = false;
    }

    async resetPwd({ id, pwd }) {
        app.loading = true;

        await app.fetch("/drop/user", { body: JSON.stringify({ id }) });
        await app.fetch("/add/user", { body: JSON.stringify({ id, pwd }) });

        app.loading = false;
    }
}
