var urllib = require('urllib');
let templateUrl = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token="

exports.sendTemplate = function (accessToken,data,callBack) {
    let url = templateUrl+accessToken;
    urllib.request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        content: JSON.stringify(data)
    },function (err, data, res) {
        callBack(err,data);
    });
};



