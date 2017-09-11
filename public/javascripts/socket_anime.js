// var dt = new Date();
var tabs = {
    "fuyu" : document.getElementById("fuyu"),
    "haru" : document.getElementById("haru"),
    "natsu" : document.getElementById("natsu"),
    "aki" : document.getElementById("aki")
};
$(function(){    
    var socket = io({
        query:{
            username: document.getElementById("username").innerHTML,
            once: document.getElementById("once").innerHTML
        }
    });
    
    var selectedYear = dt.getFullYear();

    
    socket.on("disconnect",(reason)=>{
        alert("disconnect with server for "+reason);
    });

    socket.on("client init", (animeList)=>{
        var animeItem;
        var animeDiv
        
        for(var index in animeList){
            animeItem = animeList[index];
            animeDiv = document.createElement("div");
            

        }
    });

    socket.on("reconnect",(attemptNum)=>{
        console.log("reconnect: ",attemptNum)
    })



    // $(function () {
    //     var socket = io();
    //     socket.on('connect', ()=>{
    //         $('form').submit(function(){
    //         console.log("submit:",name);
    //         socket.emit('say to others', $('#m').val());
    //         $('#messages').append($('<li>').text(name+":"+$('#m').val()));
    //         $('#m').val('');
    //         window.scrollTo(0, document.body.scrollHeight);
    //         return false;
    //         });
    //     });

    //     socket.on('init', function(uname){
    //         $('#name').val(uname);
    //         name = uname;
    //     })
        
    //     socket.on('chat message', function(msg){
    //         $('#messages').append($('<li>').text(msg));
    //         window.scrollTo(0, document.body.scrollHeight);
    //     });
    //     socket.on('someone says', (name,msg)=>{
    //         $('#messages').append($('<li>').text(name+":"+msg));
    //         window.scrollTo(0, document.body.scrollHeight);
    //     })
    // });
})

function episodeAdd(year,animeID){}

function selectYear(year){
    var before = document.getElementById(selectedYear);
    before.removeAttribute('class');
    selectedYear = year;
    var yearItem = document.getElementById(year);
    yearItem.setAttribute("class","active");

    socket.emit("year change", year);
}