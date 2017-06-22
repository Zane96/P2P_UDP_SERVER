//p2p打洞的 server端
const config = require("./config");
const net = require("net");
const point_table = require("./point_table");
const msg_table = require("./message_table");
const dgram = require("dgram");

//解析Message
var parser = function pasreMessage(socket, udp_server, json) {
    //反序列化
    var message = JSON.parse(json);
    var msg;
    //登陆,存储一下内外网，然后返回LOGIN_RESULT
    console.log(`parse`);
    if(config["login"] === message.messageType) {
        console.log(`login`);
        point_table.setPoint(message.content, `${socket.remoteAddress}:${socket.remotePort}`, message.intraNet);
        socket.write(JSON.stringify(msg_table["login_result"]) + "\n");
        console.log(`send message: ${JSON.stringify(msg_table["login_result"])}`);
    } else if (config["quit"] === message.messageType) {
        point_table.deletPoint(message.content);
        socket.write(JSON.stringify(msg_table["quit_result"]) + "\n");
        console.log(`send message: ${JSON.stringify(msg_table["quit_result"])}`);
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

            //给双方发送UDP数据
            var extraNet = connect_msg.extraNet;
            console.log(extraNet.substring(extraNet.indexOf(":") + 1, extraNet.length));
            console.log(socket.remotePort);
            var msg = new Buffer(JSON.stringify(connect_msg) + "\n");
            udp_server.send(msg, 0, msg.length, socket.remotePort, socket.remoteAddress);

            connect_msg.extraNet = socket.remoteAddress + ":" + socket.remotePort;
            connect_msg.intraNet = message.intraNet;
            var msg2 = new Buffer(JSON.stringify(connect_msg) + "\n");
            udp_server.send(msg2, 0, msg2.length, extraNet.substring(extraNet.indexOf(":") + 1, extraNet.length), extraNet.substring(0, extraNet.indexOf(":")));
            
            console.log(`send udp message: ${JSON.stringify(connect_msg)}`);
        } else {
            socket.write(JSON.stringify(msg_table["not_found"]) + "\n");
            console.log(`send message: ${JSON.stringify(msg_table["not_found"])}`);
        }
    }
};

var register = () => {
    const udp_server = dgram.createSocket("udp4");
    udp_server.on("message", (msg, rinfo) => {
        console.log(`${msg} : ${rinfo.address}:${rinfo.port} cross the udp pipe`);
    });
    
    udp_server.on("listening", () => {
        console.log(`UDP Server is listenering`);
    });

    udp_server.on("error", (err) => {
        console.log(`UDP Server is error`);
        udp_server.close();
    });

    udp_server.bind(config["port"]);

    const tcp_server = net.createServer((socket) => {
        console.log(`Receive the connect from remote phone: ${socket.remoteAddress}:${socket.remotePort}`);
        
        socket.on("data", data => {
            console.log(`${data} : ${socket.remoteAddress}:${socket.remotePort}`);
            parser(socket, udp_server, data);
        });

        socket.on("close", data => {
            console.log(`Closed phone: ${socket.remoteAddress}:${socket.remotePort}`);
        })
    });

    console.log(config["host"] + config["port"]);
    tcp_server.listen(config["port"]);
    console.log(`TCP Server listenering in ${tcp_server.address().address}:${tcp_server.address().port}`);
};

module.exports = register;






