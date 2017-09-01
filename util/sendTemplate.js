
const wechatTemplate = require("./wechatTemplate");
const accessToken = require("./accessToken");
const templates = require("../config/templates");
// const templateRender = require("./templateRender");
const util = require("util");
const querystring = require('querystring');


let tempSendList = {}


/**
 * @param {obj} opt {key:value}, follow template in json, this module dose not check its formate // no color
 * @param {obj} queryObj
 */
exports.send = (official,user, opt, queryObj, templateID)=>{
    // var _atk = atk.access_token;
    var tempData = deepcopy(templates[templateID]);
    if(!tempData){
        console.error("try to send unexpected template message, templateID:", templateID);
        return false;
    }
    queryObj.user = user;
    queryObj.official = official;
    tempData.touser = user;
    if(tempData.url){
        tempData.url += '?'+querystring.stringify(queryObj);
    }
    
    for(key in opt){
        tempData.data[key].value = opt[key];
    }
    console.log("tempData",tempData);
    resend(official,tempData,3);
};

function deepcopy(obj){
    var ret = {};
    for(var key in obj){
        ret[key] = typeof(obj[key])==='object' ? deepcopy(obj[key]): obj[key];
    }
    return ret;
}

/**
 * for resend template
 * callback(tempData)
 */
exports.check = (msgid, callback)=>{
    if(typeof(callback) !== "function"){
        callback = function(){};
    }
    if(tempSendList.hasOwnProperty(msgid)){
        callback(tempSendList[msgid]);
        delete tempSendList[msgid];
    }
    else{
        console.warn("an untracked template msgid: %s, maybe it's repeated message from wechat server",msgid);
    }
}

exports.resend = resend;


/**
 * 
 * @param {string} official openid
 * @param {obj} tempData 
 * @param {int} retry 1<=retry<=5 
 */
function resend(official, tempData, retry){
    if(retry === null){
        retry = 1;
    }
    if(retry>5){
        retry = 5;
    }
    if(retry <= 0){
        console.log("send template timeout: %s=>%s",official,tempData.touser);
        console.log(tempData);
        return false;
    }

    accessToken(official,(err, atk)=>{
        var _atk = atk.access_token;
        wechatTemplate.sendTemplate(_atk, tempData, (err,data)=>{
            if(err != null){
                throw err; /*!!!!*/
            }
            data = JSON.parse(data)
            console.log("send template: %s=>%s",official,tempData.touser);
            console.log(data);

            var _msgid = data.msgid;
            if(data.errcode === 0){
                tempSendList[_msgid] = tempData;
                return true;
                // then wait for TEMPLATESENDJOBFINISH event
            }
            else if(data.errcode === -1){
                console.log("resend template message, msgid: ",_msgid," ||rest: ",retry);
                resend(official,tempData, retry-1)
            }
            else{
                console.warn('template sending is rejected by wechat server')
            }
        });
    });    
};