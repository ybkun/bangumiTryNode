var session = require('./mySession');

module.exports = (server)=>{
    var io = require('socket.io')(server);
    io.use(function(socket,next){
        socket.
        session(socket.request, socket.request.res, next);
    })
    io.on("connection", (socket)=>{
        
        socket.on('disconnect', ()=>{

        })
    });

    return io;
}