$(document).ready(function(){
        $("#submit").click(function(){
            var mainbody = {
                    openid: $("#openid")[0].innerHTML,
                    once: $("#once")[0].innerHTML,
                    username: $("#username").val(),
                    password: $("#password").val(),
                    nickname: $("#nickname")[0].innerHTML
                }
            console.log(mainbody)
            $.post("/bangumi/bind", mainbody,(data,status)=>{
                $(location).attr("href",data);
            });
        });
    });