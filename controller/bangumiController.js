var user = require("../model/user").user
const getUserInfo = require("../util/getUserInfo");
const querystring = require("querystring")
const checkRequest = require("../util/checkRequest");
const newOnce = checkRequest.newOnce;
const checkOnce = checkRequest.checkOnce;


exports.main = (req,res)=>{
    var uname = req.session.username;
    if(!uname){ // wechat user and session invalid, 
        var openid = req.query.user
        var official = req.query.official;
        user.findUserByOpenid(openid, (err, data)=>{
            if(err){
                console.error("database error: ",err);
                return res.send("error in server, please wait a moment and retry");
            }
            if(data === null){ // first time
                return getUserInfo(official,openid,"en",(userInfo)=>{
                    res.render("infoBind",
                        {
                            nickname:userInfo.nickname,
                            openid: userInfo.openid,
                            once: newOnce(openid,600)
                        } 
                    );
                });                
            }
            else{
                req.session.username = data.username;
                req.session.openid = data.openid;
                res.render("index",{nickname:data.nickname})
            }
        });
    }
    else{ // session valid, login from normal web
        // console.warn("incomplete part, should go through this fetch");
        res.render("index",{username: uname})
    }
};


exports.infobind = (req, res)=>{
    // database operation
    console.log("call infobind");
    console.log("body:",req.body);

    var body = req.body;
    var openid = body.openid;
    var uname = body.username;
    var pw = body.password;
    var once = body.once;
    var nickname = body.nickname;
    if(!checkOnce(openid,once)){
        return res.send("once timeout or wrong once");
    }
    user.new(uname,pw,openid,nickname);

    req.session.username = uname;
    req.session.openid = openid;
    res.send(req.baseurl);
}