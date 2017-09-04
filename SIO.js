var session = require('./mySession');

module.exports = (server)=>{
    var io = require('socket.io')(server);
    io.use(function(socket,next){
        session(socket.request, socket.request.res, next);
    })
    io.on("connection", (socket)=>{
        console.log("%s(%s) connect to socket",socket.request.session.username, socket.request.session.openid);
        
        socket.on('disconnect', (username, openid)=>{
            console.log("%s(%s) disconnect with socket",username, openid)
        })
    });

    return io;
}