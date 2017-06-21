//p2p打洞的 server端
const config = require("./config");
const net = require("net");
const point_table = require("./point_table");
const msg_table = require("./message_table");

//解析Message
var parser = function pasreMessage(socket, json) {
    //反序列化
    var message = JSON.parse(json);
    var msg;
    //登陆,存储一下内外网，然后返回LOGIN_RESULT
    if(config["login"] === message.messageType) {
        point_table.setPoint(message.content, `${socket.remoteAddress}:${socket.remotePort}`, message.intraNet);
        msg = msg_table["login_result"];
    } else if (config["quit"] === message.messageType) {
        point_table.deletPoint(message.content);
        msg = msg_table["quit_result"];
    } else if (config["connect"] === message.messageType) {
        var point = point_table.getPoint(message.content);
        if (point !== undefined) {
            var connect_msg = {
                extraNet : "",
                intraNet : "",
                host : "",
                port : 0,
                messageType : config["connect_result"],
                content : "success"
            } 
            connect_msg.extraNet = point.substring(0, point.indexOf("/"));
            connect_msg.intraNet = point.substring(point.indexOf("/") + 1, point.length);
            msg = connect_msg;
        } else {
            msg = msg_table["not_found"];
        }
    }
    //返回数据
    socket.write(JSON.stringify(msg));
};

var register = () => {
    var server = net.createServer((socket) => {
        console.log(`Receive the connect from remote phone: ${socket.remoteAddress}:${socket.remotePort}`);
        
        socket.on("data", data => {
            console.log(`Receive the connect from remote phone: ${socket.remoteAddress}:${socket.remotePort}`);
            parser(socket, data);
        });

        socket.on("close", data => {
            console.log(`Closed phone: ${socket.remoteAddress}:${socket.remotePort}`);
        })
    });

    console.log(config["host"] + config["port"]);
    server.listen(config["port"]);
    console.log(`Server listenering in ${server.address().address}:${server.address().port}`);
};

module.exports = register;






