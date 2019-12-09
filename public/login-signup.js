
const shadowId = Symbol();
// 主要data是user对象
const dataId = Symbol();
const domId = Symbol();
// 登录&添加用户（注册）合二为一

export default class extends window.HTMLElement {

  constructor(list = []) {
    super();
    const _this = this;

    this[dataId] = {
      id: '',
      pwd: ''
    }
    this[shadowId] = this.attachShadow({ mode: 'closed' })

    this[shadowId].innerHTML = `<div>
      <style>
         #loader {
          border: 16px solid #f3f3f3;
          border-radius: 50%;
          border-top: 16px solid #3498db;
          width: 120px;
          height: 120px;
          -webkit-animation: spin 2s linear infinite; /* Safari */
          animation: spin 2s linear infinite;
        }
        
        /* Safari */
        @-webkit-keyframes spin {
          0% { -webkit-transform: rotate(0deg); }
          100% { -webkit-transform: rotate(360deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
              
        
        
        用户名：<input type="text" id="id">
        <br>
        密码：<input type="password" id="pwd">
        <br>
        <button id="signup" onclick="app.addUser({id:app.formId.value,pwd:app.formPwd.value})">添加用户</button>
        <button id="login" onclick="app.login({id:app.formId.value,pwd:app.formPwd.value})">登录</button>

        <div id="loading" style="display:none"></div>
       </div>`

    this[domId] = {
      id: _this[shadowId].querySelector('#id'),
      pwd: _this[shadowId].querySelector('#pwd'),
      login: _this[shadowId].querySelector('#login'),
      signup: _this[shadowId].querySelector('#signup'),
    }

    // 双向绑定
    this[domId].id.oninput = async event => _this[dataId].id = event.target.value
    this[domId].pwd.oninput = async event => _this[dataId].pwd = event.target.value
    this[domId].signup.onclick = async event => {
      _this.addUser({ id: _this[dataId].id, pwd: _this[dataId].pwd })
        .catch(err => {
          window.alert(err.message || err)
        })
    }

    _this.mainUser = null

  }

  set mainUser(user) {
    const _this = this;
    if (!user) {
      _this[domId].login.innerHTML = '登录'
      _this[domId].login.onclick = async event => {
        _this.login({ id: _this[dataId].id, pwd: _this[dataId].pwd })
          .catch(err => {
            window.alert(err.message || err)
          })
      }
    }
    else {
      _this[domId].login.innerHTML = `登出（${user.id}）`
      _this[domId].login.onclick = async event => {
        window.localStorage.removeItem('token')
        window.location.reload()
      }
    }
  }


  set user({ id, pwd }) {
    this[dataId] = { id, pwd }

    this[shadowId].querySelector('#id').value = id;
    this[shadowId].querySelector('#pwd').value = pwd;
  }

  get user() {
    return this[dataId]
  }


  set loading(bool = true) {
    if (bool === true) {
      this[shadowId].querySelector('#loading').style.display = 'block'
    } else {
      this[shadowId].querySelector('#loading').style.display = 'none'

    }
  }




  async  addUser({ id, pwd }) {
    id = id.trim();
    pwd = pwd.trim();
    if (!id || !pwd) throw '用户名或密码为空'
    if (app.htpasswd.list.find(u => u.id === id)) throw `${id} 已经存在`


    this.loading = true
    const newUser = await app.fetch('/add/user', {
      body: JSON.stringify({ id, pwd }),
      mime: 'application/json',
      parser: 'json'
    })

    window.app.htpasswd.list = app.htpasswd.list.concat({ id })

    // const newUser = await res.json()
    this.loading = true


  }



  async login({ id, pwd }) {
    id = id.trim();
    pwd = pwd.trim();
    if (!id || !pwd) throw '用户名或密码为空'

    const res = await fetch('/add/login', {
      method: 'POST',
      body: JSON.stringify({ id, pwd }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })

    if (!res.ok) throw decodeURIComponent(res.headers.get('error'))

    const token = await res.text()

    // console.log(token)  
    localStorage.token = token;

    location.reload();

  }


}