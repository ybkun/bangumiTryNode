var userModel = require("../model/user").user;


module.exports = (req, res)=>{
    var post_data = req.body
    userModel.getPw(post_data.username,(err,data)=>{
        if(err){
            return console.error(err);
        }
        console.log("post: ",post_data);
        console.log("database: ",data);
        if(data!==null && post_data.password === data.password){
            req.session.username = post_data.username
            req.session.openid = data.openid;
            req.session.nickname = data.nickname;
            res.redirect('/bangumi');
            return true;
        }
        res.send('login_failed');
    })
}