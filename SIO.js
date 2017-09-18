// var session = require('./mySession');

const checkRequest = require("./util/checkRequest");
const checkOnce = checkRequest.checkOnce;
const userModel = require("./model/user").user;
const watchModel = require("./model/user").watch;
const animeModel = require("./model/anime");

let userOnline = {}
const SEASONS = ['fuyu','haru','natsu','aki'];


function buildAnimeList(data, index, ret, callback){
    if(!(ret instanceof Array)){
        throw new Error("ret should be an Array");
    }
    if(index === data.length){
        return callback(ret);
    }
    var dataItem = data[index];
    animeModel.getOne(dataItem.animeID,(err, res)=>{
        // console.log("animeModel.getOne: ", res);
        var animeItem=res.toJSON();
                
        animeItem.priority = dataItem.priority;
        animeItem.music_flag = dataItem.music_flag;
        animeItem.episode = dataItem.episode;
        ret.push(animeItem);
        // console.log("animeItem: ",animeItem)

        buildAnimeList(data, index+1, ret, callback);
    });
}



module.exports = (server)=>{
    var io = require('socket.io')(server,{
        pingTimeout: 600000  // 10 min
    });
    
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
        userModel.getAnimeList(username,dt.getFullYear(),(err,data)=>{
            if(err){
                console.error("when client init: ",err);
                return socket.emit('client init',{errcode:40001,errmsg:"server db error"});
            }
            buildAnimeList(data, 0, [], (animeList)=>{
                console.log("animeList is ",animeList);
                socket.emit('client init', animeList);
            }); 
        });
        
        socket.on('disconnect', ()=>{
            console.log("%s(%s) disconnect with socket", socket.username, socket.id);
            delete userOnline[socket.username];
        });

        socket.on("year require", (year)=>{
            console.log("socket year require")
            userModel.getAnimeList(socket.username,year,(err,data)=>{
                if(err){
                    console.error("in year require event: ",err);
                    return socket.emit('year response',{errcode:40001,errmsg:"server db error"});
                }
                buildAnimeList(data, 0, [], (animeList)=>{
                    // console.log("animeList is ",animeList);
                    socket.emit('year response', animeList);
                }); 
            });
        });

        socket.on("set episode", (animeID, episode)=>{
            watchModel.setEpisode(socket.username, animeID, episode);
        });
        socket.on("set priority", (animeID, priority)=>{
            watchModel.setPriority(socket.username, animeID, priority);
        });
        socket.on("set music", (animeID, flag)=>{
            watchModel.setMusic(socket.username,animeID,flag);
        });
        
    });

    return io;
}