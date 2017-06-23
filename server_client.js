//p2p打洞的 server端
const config = require("./config");
const net = require("net");
const point_table = require("./point_table");
const msg_table = require("./message_table");
const dgram = require("dgram");

//解析Message
var parser = (socket, udp_server, json) => {
    //反序列化
    var message = JSON.parse(json);
    var msg;
    //登陆,存储一下内外网，然后返回LOGIN_RESULT
    console.log(`parse`);
    if(config["login"] === message.messageType) {
        console.log(`login`);
        point_table.setPoint(message.content, message.intraNet);

        socket.write(JSON.stringify(msg_table["login_result"]) + "\n");
        console.log(`send message: ${JSON.stringify(msg_table["login_result"])}`);
    } else if (config["quit"] === message.messageType) {
        point_table.deletPoint(message.content);
        point_table.deletPoint(message.intraNet);
        socket.write(JSON.stringify(msg_table["quit_result"]) + "\n");

        console.log(`send message: ${JSON.stringify(msg_table["quit_result"])}`);
    } else if (config["connect"] === message.messageType) {
        var connect_info = message.content;
        var from_name = connect_info.substring(0, connect_info.indexOf(":"));
        var to_name = connect_info.substring(connect_info.indexOf(":") + 1, connect_info.length);
        console.log("found name------" + from_name + " " + to_name);
        var from_intra = point_table.getPoint(from_name);
        var to_intra = point_table.getPoint(to_name);

        console.log("found ------" + from_intra + " " + to_intra);
        if (from_intra !== undefined && to_intra !== undefined) {
            var from_extra = point_table.getPoint(from_intra);
            var to_extra = point_table.getPoint(to_intra);

            var connect_msg = {
                extraNet : "",
                intraNet : "",
                host : "",
                port : 0,
                messageType : config["connect_result"],
                content : "success"
            } 
            
            //给双方发送udp连接数据
            connect_msg.extraNet = to_extra;
            connect_msg.intraNet = to_intra;
            connect_msg.content = from_extra.substring(0, from_extra.indexOf(":"));
            //var msg_from = Buffer.from(JSON.stringify(connect_msg));
            // udp_server.send(msg_from, from_extra.substring(from_extra.indexOf(":") + 1, from_extra.length), from_extra.substring(0, from_extra.indexOf(":")), (err) => {
            //     console.log(`error in send udp message: ${err}`);
            // });
            socket.write(JSON.stringify(connect_msg) + "\n");

            connect_msg.extraNet = from_extra;
            connect_msg.intraNet = from_intra;
            connect_msg.content = to_extra.substring(0, to_extra.indexOf(":"));
            var msg_to = Buffer.from(JSON.stringify(connect_msg));
            udp_server.send(msg_to, to_extra.substring(to_extra.indexOf(":") + 1, to_extra.length), to_extra.substring(0, to_extra.indexOf(":")), (err) => {
                console.log(`error in send udp message: ${err}`);
            });
            
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

        //存储应用内网地址到udp通道的外网地址的映射
        var message = JSON.parse(msg);
        point_table.setPoint(message.content, `${rinfo.address}:${rinfo.port}`);
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






