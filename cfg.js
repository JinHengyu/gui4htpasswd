module.exports = {
    // htpasswd密码文件的绝对路径
    htpasswd: "C:\\Users\\jim\\.config\\verdaccio\\htpasswd",
    // 管理员权限：修改所有人密码，删除用户
    whiteList: ["superbug"],
    port: 4874,



    // 30秒间隔    
    drop_interval: 30 * 1000,
    drop_last: Date.now() - 30 * 1000,
    jwtSecret: "gui4passwd",
    maxLines: 1000,
    version:'0.0.3',
    cacheInSec:365*86400
};
