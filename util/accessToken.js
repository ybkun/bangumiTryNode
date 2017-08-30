/**
 * Changed by Asher at 2017/08/16
 * support multi-wechat-official-account to get accessToken
 */

const wechat_config = require("../config/wechat.json");

var urllib = require("urllib");

let accessToken = {};
/**structure of accessToken
 * {
 *  openID_1:{
 *      access_token: ACCESS_TOKEN,
 *      expires_in: SECONDS
 *      start: TIME_SECOND_INT
 *  },
 *  openID_2:{
 *      ...
 *  }
 * }
 */


for(openId in wechat_config.accounts){
    accessToken[openId] = null;
}

function AccessToken(officialOpenId,callback) {

    if( !(officialOpenId in accessToken) ){
        callback(new Error("invalid openID"), null);
        return false;
    }
    
    var appId = wechat_config.accounts[officialOpenId].appId;
    var appSecret = wechat_config.accounts[officialOpenId].appSecret;
    var accessTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;

    var targetToken = accessToken[officialOpenId];    

    if (targetToken !== null && (Date.now()/1000-targetToken.start)<targetToken.expires_in ) {
        var tokenUsed = Date.now()/1000-targetToken.start;
        if(tokenUsed<0){
            tokenUsed = 0;
        }
        console.log("accessToken(%s) used: %f s", targetToken.access_token, tokenUsed);
        callback(null, targetToken);
    } else {
        NewAccessToken(accessTokenUrl,officialOpenId,callback);
    }
}

function NewAccessToken(accessTokenUrl, officialOpenId, callback){
    console.log(officialOpenId," get new accessToken");
    urllib.request(accessTokenUrl, function (err, data, res) {
        if(err !== null){
            console.error("Error occured when get new accessToken");
            throw err; // !!!!!
        }
        var atk = JSON.parse(data);
        accessToken[officialOpenId] = atk;
        accessToken[officialOpenId].start = parseInt(Date.now()/1000)+20; //waste 20 sec to make sure local token works
        console.log("new accessToken of %s is ",officialOpenId,atk.access_token)
        callback(err, atk);
    });
}

module.exports = AccessToken;

