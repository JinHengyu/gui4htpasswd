module.exports = {

    port: 8080,
    protocol: 'https'
    ,
    htpasswd: 'C:\\Users\\jim\\.config\\verdaccio\\htpasswd'
    , drop_last: Date.now()-60*1000, 
    // 1分钟
    drop_interval: 60 * 1000,
    jwtSecret:'gui4passwd',
    whiteList:['admin']
}