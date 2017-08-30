/**
 * get wechat user information
 * wechat doc: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140839
 */


var urllib = require('urllib');

/**
 * 
 * @param {string} access_token 
 * @param {string} user
 * @param {string} lang 'zh_CN' or 'zh_TW' or 'en'
 * @param {func(data)} callback
 */
exports.byOpenId = function(access_token, user, lang, callback){
    var apiurl = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${access_token}&openid=${user}&lang=${lang}`
    urllib.request(apiurl,function(err, data, res) {
        if(err !== null){
            console.error("Error occured when get user information, openid=%s",user);
            throw err; // !!!!!
        }
        
        callback(JSON.parse(data));
    });
}