const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')
const crypto = require('crypto')

module.exports = async (req, res) => {
    req.paths.shift();
    await new Promise(resolve => bodyParser.json()(req, res, resolve))


    if (req.paths[0] === 'user') {

        let {id} = req.body;


        const ms2wait = cfg.drop_last + cfg.drop_interval - Date.now();
        if(ms2wait >= 0)throw  `删除过于频繁, 再等待 ${~~(ms2wait / 1000)} 秒`

const htpasswdRaw = await new Promise((resolve,reject)=>{
    
})










        cfg.drop_last = Date.now();
    


    }
    else throw '找不到资源：' + req.url

}