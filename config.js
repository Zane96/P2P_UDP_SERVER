//配置常量
const SERVER_HOST = "127.0.0.1";
const SERVER_PORT = 9000;

const MESSAGE_TYPE_LOGIN = "login";
const MESSAGE_TYPE_LOGIN_RESULT = "login_result";
const MESSAGE_TYPE_QUIT = "quit";
const MESSAGE_TYPE_QUIT_RESULT = "quit_result";
const MESSAGE_TYPE_CONNECT = "connect";
const MESSAGE_TYPE_CONNECT_RESULT = "connect_result";

module.exports = {
    "host" : SERVER_HOST,
    "port" : SERVER_PORT,
    "login" : MESSAGE_TYPE_LOGIN,
    "login_result" : MESSAGE_TYPE_LOGIN_RESULT,
    "quit" : MESSAGE_TYPE_QUIT,
    "quit_result" : MESSAGE_TYPE_QUIT_RESULT,
    "connect" : MESSAGE_TYPE_CONNECT,
    "connect_result" : MESSAGE_TYPE_CONNECT_RESULT
}
