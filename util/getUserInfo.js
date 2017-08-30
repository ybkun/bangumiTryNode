const wechatUserInfo = require("./wechatUserInfo");
const accessToken = require('./accessToken'); 

/**
 * 
 * [use accessToke first]
 * 
 * @param {string} official 
 * @param {string} user
 * @param {string} lang 'zh_CN' or 'zh_TW' or 'en'
 * @param {fn} callback callbak(data)
 */
module.exports = function(official, user, lang, callback){
    accessToken(official, (err, atk)=>{
        var _atk = atk.access_token;
        wechatUserInfo.byOpenId(_atk, user, lang, (data)=>{
            console.log('get user info of %s: \n',user,data);
            callback(data);
        });
    });
};