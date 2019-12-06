
const shadowId = Symbol();



export default class extends window.HTMLElement {

    static get wiki() {
        console.table({
            version: { info: '0.1' },
            description: { info: '这是一个modal组件' },
            makeAlert: {
                info: '创建alert的快捷方式',
                params: 'title: string, content: string',
                return: 'Promise'
            },
            '...': { info: '...' },
        });
    }



    // 快速创建一个modal
    static async makeAlert({ title = 'Title', content = 'Content', z = 10 }) {
        const modal = window.document.createElement('uis-modal')
        modal._title = title;
        modal._content = content;

        Object.assign(modal.style, {
            'position': 'fixed',
            'width': '100%',
            'height': '100%',
            'left': '0',
            'top': '0',
            'zIndex': z,
        });
        window.document.body.appendChild(modal)
        await new Promise(resolve => {
            modal._closeButtonCallback = () => {
                modal.remove();
                resolve(new Date());
            }
        });
    }




    constructor() {
        super();

        this[shadowId] = this.attachShadow({ mode: 'closed' })

        this[shadowId].innerHTML = `
        <style>
            /* The Modal (background) */
            #modal-outer {
                display: flex; 
                justify-content: center;
                align-items: center; 
                position: absolute; 
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                overflow: auto; 
                background-color: rgba(0,0,0,0.4); 
            }

            /* Modal Content */
            #modal-inner {
                background-color: #fefefe;
                padding: 0;
                border: 1px solid #888;
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
                animation-name: myAnimation;
                animation-duration: 0.4s;
                min-width: 200px;
                min-height: 200px;
                max-width: 75%;
                max-height: 75%;
                position: absolute;
                display: flex;
                flex-direction: column;
            }

            /* Add Animation */
            @keyframes myAnimation {
                from { opacity:0}
                to { opacity:1}
            }
            
            #modal-header {
                padding: 2px 16px;
                background-color: #000066;
                color: white;
            }

            /* The Close Buttons */
            #close {
                float: right;
                font-size: 28px;
                font-weight: bold;
                width: 20px;
                filter: blur(1px);
            }
            
            #close:hover,
            #close:focus {
                cursor: pointer;
                filter: unset;
            }
            
            #title{
                font-size: 20px;
            }
            
            #content {
                font-size: 18px;
                padding: 2px 16px;
                margin: 20px 2px;
                overflow: scroll;
                word-break: break-all;
            }

        </style>

        <!-- 放在其他style元素之后以达到覆盖的目的 -->
        <style id="customStyle"> </style>


        <div id="modal-outer">
            <div id="modal-inner">
                <div id="modal-header">
                    <img id="close">
                    <h1 id="title">Title</h1>
                </div>
                <div id="content"> 
                    Content
                <div>
            </div>
        </div>   `;
    }




    connectedCallback() {

        this[shadowId].querySelector('img#close').src = `
                    data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.9 21.9" enable-background="new 0 0 21.9 21.9">
                    <path fill="white" d="M14.1,11.3c-0.2-0.2-0.2-0.5,0-0.7l7.5-7.5c0.2-0.2,0.3-0.5,0.3-0.7s-0.1-0.5-0.3-0.7l-1.4-1.4C20,0.1,19.7,0,19.5,0  c-0.3,0-0.5,0.1-0.7,0.3l-7.5,7.5c-0.2,0.2-0.5,0.2-0.7,0L3.1,0.3C2.9,0.1,2.6,0,2.4,0S1.9,0.1,1.7,0.3L0.3,1.7C0.1,1.9,0,2.2,0,2.4  s0.1,0.5,0.3,0.7l7.5,7.5c0.2,0.2,0.2,0.5,0,0.7l-7.5,7.5C0.1,19,0,19.3,0,19.5s0.1,0.5,0.3,0.7l1.4,1.4c0.2,0.2,0.5,0.3,0.7,0.3  s0.5-0.1,0.7-0.3l7.5-7.5c0.2-0.2,0.5-0.2,0.7,0l7.5,7.5c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l1.4-1.4c0.2-0.2,0.3-0.5,0.3-0.7  s-0.1-0.5-0.3-0.7L14.1,11.3z"/>
                </svg> `;


        this._closeButton = this[shadowId].querySelector("#close");

        this._closeButton.onclick = this.remove.bind(this);

    }


    disconnectedCallback() {
        this._closeButton.onclick = null;

    }

    get customStyle() {
        return this[shadowId].querySelector('style#customStyle').innerHTML;
    }
    set customStyle(newStyle) {
        this[shadowId].querySelector('style#customStyle').innerHTML = newStyle;
    }



    get _title() {
        return this[shadowId].querySelector('#title').innerHTML;
    }
    set _title(title) {
        this[shadowId].querySelector('#title').innerHTML = title;
    }

    get _content() {
        return this[shadowId].querySelector('#content').innerHTML;
    }
    set _content(content) {
        this[shadowId].querySelector('#content').innerHTML = content;
    }

    set _closeButtonCallback(callback) {

        this._closeButton.onclick = callback.bind(this);

        // delete this;
    }


};


