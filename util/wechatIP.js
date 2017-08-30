var urllib = require("urllib");
const accessToken = require("./accessToken");
const accountInfo = require("../config/wechat.json").accounts

let IP_Url = "https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token="

let ip_list = []
let updateTime = 0

function getWechatIP(accessToken){
    console.log("call getIP")
    var url = IP_Url+accessToken;
    urllib.request(url, {
        method: 'GET',
    },function (err, data, res) {
        if(err !== null){
            console.error("Error occured when get wechat IP");
            throw err; // !!!!!
        }
        ip_list = JSON.parse(data)['ip_list'];
        updateTime = Date.now()/1000;
    });
}

exports.check = function(addr){
    console.log('POST from ',addr);
    console.log('wechat ip list: ',ip_list)
    if(ip_list.length == 0 || (Date.now()/1000 - updateTime)>86400){
        var baseAccount;
        for(key in accountInfo){
            baseAccount = key;
            break;
        }
        console.log("baseAccount: ",baseAccount);
        accessToken(baseAccount,(err, atk)=>{
            if(err !== null){
                console.log(accountInfo,'\n',baseAccount);
                throw err; //!!!!!!
            }
            var _atk=atk.access_token;
            getWechatIP(_atk);
        });
        console.log("refresh wechat ip list:\n",ip_list);
    }
    for(index in ip_list){
        if(addr === ip_list[index]){
            return true;
        }
    }
    return false;
}
