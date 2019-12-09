
const shadowId = Symbol();
const dataKey = Symbol();


export default class extends window.HTMLElement {

  constructor(list = []) {
    super();
    const _this = this;

    this[shadowId] = this.attachShadow({ mode: 'closed' })

    this[shadowId].innerHTML = `<div>
        <style>
            .lds-dual-ring {
                display: inline-block;
                width: 80px;
                height: 80px;
              }
              .lds-dual-ring:after {
                content: " ";
                display: block;
                width: 64px;
                height: 64px;
                margin: 8px;
                border-radius: 50%;
                border: 6px solid #000;
                border-color: #000 transparent #000 transparent;
                animation: lds-dual-ring 1.2s linear infinite;
              }
              @keyframes lds-dual-ring {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            </style>
              
            <div class="lds-dual-ring"></div>

            <ul></ul>
        </div>`

    this[shadowId].querySelector('ul').addEventListener('click', async event => {
      try {

        if (event.target.tagName.toLowerCase() !== 'button') return
        const userId = event.target.getAttribute('data-userId')
        if (!confirm(`确定删除${userId}？`)) return

        await _this.dropUser({ id: userId })
        window.alert(`${userId}已删除`)
      } catch (err) {
        alert(err.message || err)
        _this.loading = false
      }
    })

    this.list = list


  }



  set list(list) {
    this[dataKey] = list

    this[shadowId].querySelector('ul').innerHTML = `
                ${list.map(({ id }) => `<li>${id} <button data-userId="${id}">删除</button> </li>`).join('')}
             `;
  }

  get list() {
    return this[dataKey]
  }


  set loading(bool = true) {
    if (bool === true) {
      this[shadowId].querySelector('.lds-dual-ring').style.display = 'block'
    } else {
      this[shadowId].querySelector('.lds-dual-ring').style.display = 'none'

    }
  }




  async  dropUser({ id }) {




    this.loading = true
    const res =

      await app.fetch('/drop/user', { body: JSON.stringify({ id }), mime: 'application/json' })

    app.htpasswd.list = app.htpasswd.list.filter(u => u.id !== id)

    // await res.arrayBuffer()
    this.loading = false



  }


}