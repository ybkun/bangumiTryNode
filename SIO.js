// var session = require('./mySession');

const checkRequest = require("./util/checkRequest");
const checkOnce = checkRequest.checkOnce;
const userModel = require("./model/user").user;
const animeModel = require("./model/anime");

let userOnline = {}

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
        socket.username = username;
        userOnline[username] = socket.id;
        
        socket.on('disconnect', ()=>{
            console.log("%s(%s) disconnect with socket", socket.username, socket.id);
            delete userOnline[socket.username];
        });
        socket.on('req init',(year)=>{
            console.log("user require init page\n");
            userModel.getAnimeList(socket.username,year, (err, animeList)=>{
                var animeID;
                for(var index in animeList){
                    animeID = animeList[index];

                    // i want 
                    animeModel.get(animeID, (err,info)=>{
                        
                    })

                }

            })

        });
    });

    return io;
}