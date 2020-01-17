module.exports = {
    // 必填
    htpasswd: "C:\\Users\\jim\\.config\\verdaccio\\htpasswd", // htpasswd密码文件的绝对路径
    whiteList: ["jim", "jean", "jimmy"], // 管理员权限：修改所有人密码，删除用户
    port: 4874, //端口号

    // 选填
    appName: "gui4passwd", // 凭证签名
    version: "0.0.5", //http ETag
    drop_interval: 30 * 1000, // http delete防抖
    drop_last: Date.now() - 30 * 1000, //上次http delete日期
    log_interval: 60 * 1000, // 日志防抖
    log_last: Date.now(), //上次日志日期
    maxLines: 1000, // htpasswd最大行数
    cacheInSec: 365 * 86400, //浏览器缓存（秒）
    sessionInSec: 12 * 60 * 60 //会话有效期（秒）
};
