/*
* It too hard to use xml2js to build xml with CDATA, which is required by wechat server,
* so I write this function to transfer a json-like object to target xml.
* 
* I am not sure where should I put this function yet.
* 
* Usage: 
* if you want 
        <xml>
        <ToUserName><![CDATA[toUser]]></ToUserName>
        <FromUserName><![CDATA[fromUser]]></FromUserName>
        <CreateTime>12345678</CreateTime>
        <MsgType><![CDATA[news]]></MsgType>
        <ArticleCount>2</ArticleCount>
        <Articles>
        <item>
        <Title><![CDATA[title1]]></Title> 
        <Description><![CDATA[description1]]></Description>
        <PicUrl><![CDATA[picurl]]></PicUrl>
        <Url><![CDATA[url]]></Url>
        </item>
        <item>
        <Title><![CDATA[title]]></Title>
        <Description><![CDATA[description]]></Description>
        <PicUrl><![CDATA[picurl]]></PicUrl>
        <Url><![CDATA[url]]></Url>
        </item>
        </Articles>
        </xml>

* object should be like 
*       {
*           ToUserName: {cdata:true, value:user},
*           FromUserName: {cdata:true, value:offical},
*           ...
*           ArticaleCount: 2,
*           Articales: {
*                       item: {
*                           Title: {cdata:true, value: title1}
*                           ...
*                       }
*                       item: {...}
*                   }
*       }
* 
*/

function createWechatXml(obj){
    let ret = "<xml>";
    var tag,conten;
    for(key in obj){
        tag = key;
        _content = obj[key];
        ret += createWechatXmlLine(tag, _content)
        
    }
    ret += "</xml>";
    return ret;
}

function createWechatXmlLine(tag, content){
    let ret='<' + tag + '>';
    if(typeof(content) == 'object'){
        if(content.cdata === true){ // cover by cdata
            ret += '<![CDATA[' + content.value + ']]>';
        }
        else{ // still has sublines
            for(key in content){
                ret += createWechatXmlLine(key,content[key]);
            }
        }
    }
    else{
        ret += content;
    }
    ret += '</' + tag +'>';

    return ret;
};

module.exports = createWechatXml;