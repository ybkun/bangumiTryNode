var mongoose = require("mongoose");
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
        unique: true
    }
});

var watchSchema = new Schema({
    year:{
        type: Date
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
    watch:[watchSchema]
});


var adminSchema = userSchema.clone();

var userModel = mongoose.model('user',userSchema);
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
        )
    },
    getPw: (username,callback)=>{
        userModel.findOne({username:username}, {_id:0,password:1}, callback)
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
        userEntity.save();
    }
}
