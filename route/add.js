const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')

module.exports = async (req, res) => {
    req.paths.shift();

    await new Promise(resolve => bodyParser.json()(req, res, resolve))
    // console.log(req.body)
    if (req.paths[0] === 'user') {
        




    }
    else throw '找不到资源：' + req.url

}