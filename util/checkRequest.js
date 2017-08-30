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
 * check the GET request from wechat-server or not
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