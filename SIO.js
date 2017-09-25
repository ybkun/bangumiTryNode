var sessionStore = require('./mySession').sessionStore;

const checkRequest = require("./util/checkRequest");
const checkOnce = checkRequest.checkOnce;
const userModel = require("./model/user").user;
const watchModel = require("./model/user").watch;
const animeModel = require("./model/anime");

let userOnline = {}
const SEASONS = {'fuyu':1,'haru':2,'natsu':3,'aki':4};


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
            return socket.disconnect(true);
        }

        socket.username = username;
        if(userOnline[username]){ // avoid memory leak
            repeatedLogin(userOnline[username]);
        }
        userOnline[username] = socket;

        var dt = new Date();
        userModel.getAnimeList(username,dt.getFullYear(),(err,data)=>{
            if(err){
                console.error("when client init: ",err);
                return socket.emit('client init',{errcode:40001,errmsg:"server db error"});
            }
            buildAnimeList(data, 0, [], (animeList)=>{
                // console.log("animeList is ",animeList);
                socket.emit('client init', animeList);
            });
        });

        socket.on("user logout",()=>{
            console.log("%s(%s) logout", socket.username,socket.id);
            delete userOnline[socket.username];
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

        socket.on("search anime", (title, year)=>{
            searchAnime(socket.username,title,year,(res)=>{
                // res is handled by eliminateWatchedFromSearch()
                res.sort(seasonCompare);
                // console.log("title&year: ",title,year);
                // console.log("res: ",res);
                socket.emit("search response",res);
            });
        });
        socket.on("add2watch",(animeID)=>{
            animeModel.getOne(animeID, (err,res)=>{
                if(err){
                    socket.emit("add2watch fail",animeID);
                    return console.error("Error occured when add2watch: ",socket.username,err);
                }
                userModel.addAnime(socket.username,res.year,animeID, (err,res)=>{
                    if(err){
                        socket.emit("add2watch fail",animeID);
                        return console.error("Error occured when userModel.addAnime in add2watch: ",socket.username,err);
                    }
                    buildAnimeList(res,0,[],(list)=>{
                        socket.emit("add2watch success", list);
                        console.log("add2watch success: ",socket.username, res);
                    });
                });
            });
        });
        
    });

    return io;
}

function searchAnime(username, title, year, callback){
    var conditions = {};
    year = year-0;
    if(title){conditions.title=title}
    if(year){conditions.year=year}
    // console.log("in searchAnime: ", conditions)
    animeModel.search(conditions,(res)=>{
        eliminateWatchedFromSearch(username,res,callback);
    }); 
}

function eliminateWatchedFromSearch(username,docs,callback){
    var ids = [];
    for(var index in docs){
        ids.push({animeID: docs[index].animeID});
    }
    watchModel.findMany(username, ids, (res)=>{
        var idoc=0;
        var ires=0;
        while(idoc<docs.length && ires<res.length){
            while(docs[idoc]<res[ires]){
                idoc+=1;
            }
            if(docs[idoc].animeID == res[ires].animeID){
                docs.splice(idoc,1);
            }
            ires+=1;
        }
        callback(docs);
    });
}

function seasonCompare(a,b){
    if(SEASONS[a.season] < SEASONS[b.season]){
        return -1;
    }
    else{
        return 1;
    }
}


function repeatedLogin(oldSocket){
    oldSocket.emit("repeatedLogin");
    setTimeout(oldSocket.disconnect(true),100);
}