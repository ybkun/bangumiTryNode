// var session = require('./mySession');

module.exports = (server)=>{
    var io = require('socket.io')(server);
    
    io.on("connection", (socket)=>{
        // console.log("%s(%s) connect to socket",socket.request.session.username, socket.request.session.openid);
        // console.log(socket.request)
        console.log("new connection")
        console.log("session:",socket.request.session)
        socket.on('disconnect', (username, openid)=>{
            console.log("%s(%s) disconnect with socket",username, openid)
        });
        socket.on('req init',()=>{
            console.log("user require init page\n")
        });
    });

    return io;
}