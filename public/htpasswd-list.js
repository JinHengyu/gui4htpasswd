
const shadowId = Symbol();
const dataKey = Symbol();


export default class extends window.HTMLElement {

    constructor(list = []) {
        super();

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



        this.list = list


    }



    set list(list) {
        this[dataKey] = list

        this[shadowId].querySelector('ul').innerHTML = `
                ${list.map(({ id }) => `<li>${id} <button>删除</button> </li>`).join('')}
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



}