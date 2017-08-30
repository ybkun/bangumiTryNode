const wechatXml = require("./wechatXml");
const helpInfoJson = require("../config/userHelpInfo.json");
const util = require("util");
const wechatEvent = require("./wechatEvent");
const getUserInfo = require("./getUserInfo");
const sendUserInfoTemplate = require("./sendUserInfoTemplate");

const helpInfo = json2string(helpInfoJson);

/**Require custom function modules below  */
const testTemplate = require("./sendTemplate"); // remove 
/**END */

let handling = [];


function json2string(jsonObj) {
    ret = "";
    for(key in jsonObj){
        ret += key+":"+jsonObj[key]+"\n";
    }
    return ret;
}

module.exports = (req, res, data)=>{

    console.log("[debug]data received:");
    console.log(data);

    let res_xml = "success";
    
    let xml = data.xml;
    let official = xml.ToUserName[0];
    let user = xml.FromUserName[0];
    let msg = xml.Content;
    let type = xml.MsgType;
    var msgid = xml.MsgId;
    

    var robj = {
        ToUserName: {cdata:true,value:user},
        FromUserName: {cdata:true,value:official},
        MsgType: {cdata:true,value:'text'},
        Content: {cdata:true,value:"defualt response"},
        CreateTime: parseInt(Date.now()/1000) // neccesary but useless, wechat server donot check
    };

    // auto response to wechat
    var ifResponseMessage = true;
    if(type == 'event'){// handle event
        ifResponseMessage = false;
        var Event = xml.Event[0];
        var EventKey = xml.EventKey;
        switch(Event){
            case 'CLICK':
                wechatEvent.Click(official,user,EventKey[0]);
                break;
            case 'subscribe':
                break;
            case 'unsubscribe':
                break;
            case 'SCAN':
                break;
            case 'LOCATION':
                break;
            case 'VIEW':
                break;
            case 'TEMPLATESENDJOBFINISH':
                var status = xml.Status[0];
                var MsgID = xml.MsgID[0]; // Caution: different from MsgId in normal message
                wechatEvent.TemplateSendJobFinish(official,user,MsgID,status);
                break;
            default:
                console.error("unexpected wechat event: ", Event);
        }
    }
    else{
        // handle normal message
        msgid = msgid[0];
        if(handling.indexOf(msgid) !== -1){ // repeated message
            return "repeated "+msgid;
        }
        handling.push(msgid);
        console.log("handling list: ",handling);

        if(type == 'text'){
            // console.log(msg);
            msg = msg[0];
            switch(msg){
                case /^get template/.test(msg) && msg:
                    ifResponseMessage = false;
                    testTemplate(official, user, templateID=1);
                    break;
                case 'help':
                case '?':
                case '？':
                    robj.Content.value = helpInfo;
                    break;
                case 'get my info':
                    ifResponseMessage = false;
                    sendUserInfoTemplate(official, user, 'en');
                    break;
                default:
                    robj.Content.value = util.format("we get your message:\n  %s",msg);
            }
        }
        else{
            console.warn("unhandled message type");
            ifResponseMessage = false;
        }
    }
    
    if(ifResponseMessage){
        res_xml = wechatXml(robj);
    }
    responseXml(res_xml,res, ()=>{
        if(msgid){
            var index = handling.indexOf(msgid);
            if(index === -1){
                console.error("handling untracked msgid:", msgid);
            }
            handling.splice(index,1);
            msgid = null;
        }
    });
}

function responseXml(res_xml,res, callback){
    console.log("reponse to wechat server:\n", res_xml);
    res.send(res_xml);
    callback();
}