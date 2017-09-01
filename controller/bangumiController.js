var userModel = require("../model/user").user
const getUserInfo = require("../util/getUserInfo");
const querystring = require("querystring")


exports.main = (req,res)=>{
    var uname = req.session.username;
    if(!uname){ // wechat user and session invalid, 
        var openid = req.query.user
        var official = req.query.official;
        userModel.findUserByOpenid(openid, (err, data)=>{
            if(data === null){ // first time
                return getUserInfo(official,openid,"en",(userInfo)=>{
                    res.render("infoBind",
                        {
                            nickname:userInfo.nickname,
                            openid: userInfo.openid
                        } 
                    );
                    // res.redirect('../infobind?'+querystring.stringify({nickname:userInfo.nickname,openid: userInfo.openid}))
                });                
            }
            else{
                res.session.username = data.username;
                res.render("index",{nickname:data.nickname})
            }
        })
    }
    else{ // session valid
        // console.warn("incomplete part, should go through this fetch");
        res.render("index",{username: uname})
    }
};


exports.infobind = (req, res)=>{
    // database operation
}