//内置好返回的Message序列化对象

const config = require("./config");

var msg_login_result = {
    extraNet : "",
    intraNet : "",
    host : "",
    port : 0,
    messageType : config["login_result"],
    content : "success"
};

var msg_quit_result = {
    extraNet : "",
    intraNet : "",
    host : "",
    port : 0,
    messageType : config["quit_result"],
    content : "success"
};

var msg_not_found = {
    extraNet : "",
    intraNet : "",
    host : "",
    port : 0,
    messageType : config["connect_result"],
    content : "not found"
};

module.exports = {
    "login_result" : msg_login_result,
    "quit_result" : msg_quit_result,
    "not_found" : msg_not_found
};