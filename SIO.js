// var session = require('./mySession');

const checkRequest = require("./util/checkRequest");
const checkOnce = checkRequest.checkOnce;

module.exports = (server)=>{
    var io = require('socket.io')(server);
    
    io.on("connection", (socket)=>{
        console.log("new connection:", socket.id);
        let username=socket.handshake.query.username;
        let once = socket.handshake.query.once;
        if(!checkOnce(username,once)){
            console.log("%s seems to be an attacker", socket.id);
            return socket.disconnect();
        }
        // socket.on("check once", (uname,once)=>{
        //     if(!checkOnce(uname,once)){
        //         socket.disconnect(true);
        //     }
        // })
        socket.on('disconnect', ()=>{
            console.log("%s disconnect with socket",socket.id)
        });
        socket.on('req init',()=>{
            console.log("user require init page\n")
        });
    });

    return io;
}