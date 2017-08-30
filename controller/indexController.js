const wechat_config = require("../config/wechat.json");
const checkRequest = require("../util/checkRequest");
const handleXml = require("../util/handleXml");
// const wechat_ip = require("../util/wechatIP");
// const accessToken = require("../util/accessToken");
const xml2js = require('xml2js');

var parser = new xml2js.Parser();


exports.checkRequest = checkRequest.checkWechatGet;


exports.receiveWechatPost = function(req, res){
    checkRequest.checkWechatPost(req, res, handleWechatPost);
}


function handleWechatPost(req, res) {
    var post_data="";
    req.on("data",function(data){post_data += data;});
    req.on("end", function(){
        if(req.headers['content-type'] == 'text/xml'){
            var xmlStr=post_data.toString('utf-8',0,post_data.length);
            parser.parseString(xmlStr, function (err, result) {
                if(err){
                    console.error("Error in parserString(xmlStr)");
                    console.error("row string: ",post_data);
                }
                handleXml(req,res,result);
            });
        }
        else {
           console.warn("request content-type is not 'text/xml'");
           console.warn("Headers: \n",req.headers);
           console.warn("row string: ",post_data);

           res.send("");
        }
    });
};




