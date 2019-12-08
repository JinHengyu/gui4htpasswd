module.exports = {

    port: 8080,
    protocol: 'https'
    ,
    htpasswd: 'C:\\Users\\jinhe\\.config\\verdaccio\\htpasswd'
    , drop_last: Date.now(), 
    // 1分钟
    drop_interval: 60 * 1000
}