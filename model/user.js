var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var db = mongoose.createConnection('mongodb://localhost/bangumiMag');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("user.js connect to mongodb: bangumiMag");
});

var rangeList = require('../util/rangeList');

const SEASONS = ['fuyu','haru','natsu','aki'];

var watchSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    year:{
        type: Number,
        required: true
    },
    animeID:{
        type: String,
        required: true
    },
    priority:{
        type: Number,
        enum: rangeList(1,11),
        default: 5
    },
    music_flag:{
        type: Boolean,
        default: false
    },
    episode:{
        type: Number,
        required: true,
        validate:{
            validator: (v)=>{
                return v>=0;
            },
            message: '{VALUE} is not a valid episode number!'
        },
        default: 0
    },
    remarks: {}
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
    }
});


var adminSchema = userSchema.clone();

var userModel = db.model('userInfo',userSchema);

var watchModel = db.model("watch",watchSchema);

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
        watchModel.find(
            {username:username,year:year},
            {_id:0},
            callback
        )
    },
    getStartYear: (username, callback)=>{
        watchModel.findOne(
            {username:username},
            {_id:0},
            {sort: {year:1}},
            (err, res)=>{
                if(err){
                    throw err; // !!!!!
                }
                callback(res.year);
            }
        )
    },
    addAnime: (username, year, animeID, callback)=>{
        watchModel.findOne(
            {username:username,year:year,animeID:animeID},
            {_id:0},
            (err, doc)=>{
                if(err){
                    throw err; // !!!!
                }
                if(doc !== null){
                    return callback("dbError: animeID duplicate");
                }
                else{
                    watchModel.create(
                        [{
                            username:username,
                            year: year,
                            animeID: animeID,
                        }],
                        callback
                    );
                }
            }
        )
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
