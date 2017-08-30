/**
 * when receive wechat event, decide what to do with event-param
 */

const sendTemplate = require("./sendTemplate");
const getUserInfo = require("./getUserInfo")
const sendUserInfoTemplate = require("./sendUserInfoTemplate")

exports.Click = function Click(official, user, EventKey){
    switch(EventKey){
        case 'BUTTON_TEMPLATE_TEST':
            var opt = {
                head: "Head of template__change",
                key1: "info in first line",
                key2: "info in second line",
                end: "click to bilibili"
            };
            sendTemplate.send(official, user, opt, {}, templateID=1);
            break;
        case 'BUTTON_USER_INFO':
            sendUserInfoTemplate(official,user,'en');
            break;
        default:
            console.error("Unexpected Click EventKey: ",EventKey);
    }
};

exports.TemplateSendJobFinish = function TemplateSendJobFinish(official, user, msgid, status){
    switch(status){
        case 'failed:user block':
            console.log('user(%s) reject our template message')
        case 'success':
            sendTemplate.check(msgid);
            break;
        case 'failed: system failed':
            console.log("template message send failed(system failed): %s => %s", official, user);
            sendTemplate.check(msgid, (tempData)=>{
                sendTemplate.resend(official, tempData, 3);
            });
            break;
        default:
            console.error("Unexpected TemplateSendJobFinish status: ",status);
    }
}