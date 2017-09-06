var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/bangumiMag');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connect to mongodb: bangumiMag");
});

var animeListSchema = new Schema({
    animeID:{
        type: String,
        required: true,
    }
});

var watchSchema = new Schema({
    year:{
        type: Number
    },
    animeList:[animeListSchema]
});

var userSchema = new Schema({
    username: {
        type:String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true
    },
    openid: {
        type:String,
        unique: true
    },
    nickname: {
        type:String
    },
    watch:{}
});


var adminSchema = userSchema.clone();

var userModel = db.model('userInfo',userSchema);
// var adminModel = mongoose.model('adminModel',adminSchema);

// exports.user = userModel;
// exports.admin = adminModel;

exports.user = {
    findUserByName: (username, callback)=>{
        userModel.findOne(
            {username: username}, 
            {_id:0,password:0}, 
            callback
        )
    },
    findUserByOpenid: (openid, callback)=>{
        if(openid === null){
            return callback('invalid openid',null);
        }
        userModel.findOne(
            {openid: openid}, 
            {_id:0,password:0},
            callback
        );
    },
    getAnimeList: (username, year, callback)=>{
        userModel.findOne(
            {username:username},
            {_id:0,watch:1},
            (err,data)=>{
                if(err){
                    throw err; // !!!!!
                }
                var animeList = data.watch[year];
                callback(null, animeList);
            }
        );
    },
    addAnime: (username, year, animeID, callback)=>{
        userModel.findOne(
            {username:username},
            (err, user)=>{
                var new_watch = user.watch;
                var list = new_watch[year];
                // console.log(list)
                if(!list){
                    new_watch[year] = [animeID];
                }
                else{
                    for(var index in list){
                        if(list[index] == animeID){
                            return callback("dbError: animeID duplicate");
                        }
                    }
                    list.push(animeID)
                }
                // console.log("user:",user);
                // console.log("new_watch:",new_watch);
                userModel.update(
                    {username:username},
                    {$set:{watch:new_watch}},
                    callback
                );
            }
        );
    },
    getPw: (username,callback)=>{
        userModel.findOne(
            {username:username},
            {_id:0,openid:1,password:1,nickname:1},
            callback
        );
    },
    setPw: (username,pw,callback)=>{
        userModel.update({username:username},{password:pw});
    },
    bindInfo: (username,openid)=>{
        // base on username
        userModel.update({username:username},{openid:openid});
    },
    new: (username,pw,openid,nickname)=>{
        var userEntity = new userModel({
            username: username,
            password: pw,
            openid: openid,
            nickname: nickname
        });
        userEntity.save((err)=>{
            if(err){
                console.error(err);
            }
            else{
                console.log("insert new doc in user");
            }
        });
    }
}
