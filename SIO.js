// var session = require('./mySession');

const checkRequest = require("./util/checkRequest");
const checkOnce = checkRequest.checkOnce;
const userModel = require("./model/user").user;
const animeModel = require("./model/anime");

let userOnline = {}
const SEASONS = ['fuyu','haru','natsu','aki'];



module.exports = (server)=>{
    var io = require('socket.io')(server);
    
    io.on("connection", (socket)=>{
        let username=socket.handshake.query.username;
        let once = socket.handshake.query.once;
        console.log("new connection:%s(%s)", username, socket.id);
        if(!checkOnce(username,once)){
            console.log("%s seems to be an attacker", socket.id);
            return socket.disconnect();
        }
        socket.username = username;
        userOnline[username] = socket.id;

        var dt = new Date();
        userModel.getAnimeList(username,dt.getFullYear,(err,data)=>{
            if(err){
                console.error("when client init: ",err);
                return socket.emit('client init',{errcode:40001,errmsg:"server db error"});
            }
            var animeList=[];
            var dataItem;
            var animeItem;
            for(var index in data){
                dataItem = data[index];
                animeModel.getOne(dataItem.animeID,(err, res)=>{
                    animeItem=res;
                    animeItem.priority = dataItem.priority;
                    animeItem.music_flag = dataItem.music_flag;
                    animeItem.episode = dataItem.episode;
                    animeList.push(animeItem);
                })
            }
            socket.emit('client init', animeList);
        })
        
        socket.on('disconnect', ()=>{
            console.log("%s(%s) disconnect with socket", socket.username, socket.id);
            delete userOnline[socket.username];
        });
        
    });

    return io;
}