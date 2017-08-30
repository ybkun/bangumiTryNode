const sendTemplate = require("./sendTemplate");
const getUserInfo = require("./getUserInfo")

module.exports = (official, user, lang)=>{
    getUserInfo(official, user, lang, (data)=>{
        var _sex = 'unknown';
        var _subscribe_time = Date(data.subscrib_time*1000);
        if(data.sex === 1){
            _sex = 'male';
        }
        else if(data.sex === 2){
            _sex = 'female';
        }

        var opt = {
            nickname: data.nickname,
            openid: data.openid,
            sex: _sex,
            city: data.city,
            province: data.province,
            country: data.country,
            sub_time: _subscribe_time
        };
        sendTemplate.send(official, user, opt, {}, 2);
    });
};