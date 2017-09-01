const sendTemplate = require("./sendTemplate");
var host = require("../config/host.json").host
var newOnce = require("./checkRequest").newOnce;
var querystring = require("querystring")

module.exports = (official, user, isWifi)=>{
    var query = {
        once: newOnce(user),
        wifi: isWifi
    };
    var opt = {
        url: host+'/bangumi?'+querystring.stringify(query)+'&user='+user+'&official='+official
    };
    sendTemplate.send(official,user,opt,query,"entry");
}