const wechat_config = require("../config/wechat.json");
const sha1 = require("sha1");

let token = wechat_config.token;

/**
 * check the GET request from wechat-server or not
 * @param {string} token
 * @param req
 * @param res
 */
exports.checkWechatGet = function(req, res) {
  let query = req.query;
  let list = [token, query.timestamp, query.nonce].sort().join("");
  let sha = sha1(list);
  if (sha === query.signature) {
    res.send(query.echostr);
  } else {
    res.status(500).send('Not Acceptable')
  }
};


/**
 * check the POST request from wechat-server or not
 * @param {string} token 
 * @param {res.query} query 
 */
exports.checkWechatPost = function(req, res, callback) {
  let query = req.query;
  let list = [token, query.timestamp, query.nonce].sort().join("");
  let sha = sha1(list);
  if (sha === query.signature) {
    callback(req, res)
  } else {
    console.log('recieve a non-wechat POST');
    res.status(500).send('Not Acceptable')
  }
};

function randomStr(length){
  var chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  var ret = '';
  for(var i=0;i<length;i++){
    ret += chars.charAt(Math.ceil(Math.random()*100000000)%chars.length);
  }
  return ret;
}


let onceList = {};
exports.newOnce = function(user){
  if(onceList[user]){
    clearTimeout(onceList[user].id_of_timeout);
  }
  
  var once = randomStr(32);
  onceList[user] = {}
  onceList[user].once = once;
  onceList[user].id_of_timeout = setTimeout(()=>{
    console.log("once timeout:%s(%s)",onceList[user].once, user)
    delete onceList[user];
  },120000)
  return once;
}
exports.checkOnce = function(query){
  // console.log("call checkOnce")
  // console.log("oncelist: ",onceList)
  // console.log("query:",query)
  let openid = query.user;
  let once = query.once;
  if(!openid || !once || !onceList[openid]){
    return false;
  }
  if(once===onceList[openid].once){
    console.log("once used: %s(%s)",once,openid)
    clearTimeout(onceList[openid].id_of_timeout)
    delete onceList[openid];
    return true;
  }
  return false;
}