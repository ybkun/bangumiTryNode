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
            if(data === null){ // first time, bind info before use
                return getUserInfo(official,openid,"en",(userInfo)=>{
                    res.render("infoBind",
                        {
                            nickname: userInfo.nickname,
                            openid: userInfo.openid,
                            once: newOnce(openid,600)
                        } 
                    );
                });                
            }
            else{
                req.session.username = data.username;
                req.session.openid = data.openid;
                req.session.nickname = data.nickname;
                // uname = data.nickname;

                user.getStartYear(data.username, (start)=>{
                    res.render("index",
                        {
                            username: data.username,
                            nickname: data.nickname,
                            start:start,
                            end:(new Date()).getFullYear(),
                            once: newOnce(data.username,60)
                        }
                    );
                });
                
            }
        });
    }
    else{
        // user.findUserByName(uname,(err,data)=>{
        //     if(err){
        //         console.error("database error: ",err);
        //         return res.send("error in server, please wait a moment and retry");
        //     }
        //     user.getStartYear(data.username, (start)=>{
        //         res.render("index",
        //             {
        //                 username: data.username,
        //                 nickname: data.nickname,
        //                 start:start,
        //                 end:(new Date()).getFullYear(),
        //                 once: newOnce(uname,20)
        //             }
        //         );
        //     });
        // });
        user.getStartYear(uname, (start)=>{
            res.render("index",
                {
                    username: uname,
                    nickname: req.session.nickname,
                    start: start,
                    end: (new Date()).getFullYear(),
                    once: newOnce(uname,60)
                }
            );
        });
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
    req.session.nickname = nickname;
    res.send(req.baseurl);
}