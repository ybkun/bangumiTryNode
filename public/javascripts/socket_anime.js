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
    
    var dt = new Date();
    var selectedYear = dt.getFullYear();

    
    socket.on("disconnect",(reason)=>{
        alert("disconnect with server for "+reason);
    });

    socket.on("client init", (animeList, wifi)=>{
        console.log("Event: client init");
        console.log(animeList);

        var animeItem;
        var animeBlock;
        var priority;
        var checkbox;
        var episode;

        var seasonNode;
        
        for(var index in animeList){
            animeItem = animeList[index];
            
            console.log("handling ",animeItem);

            animeBlock = document.getElementById("animeNodeTemp").cloneNode(true);
            animeBlock.setAttribute("id",animeItem.animeID);
            animeBlock.getElementsByClassName("anime-title")[0].innerHTML = animeItem.title;
            animeBlock.getElementsByClassName("description")[0].innerHTML = animeItem.description;

            priority = animeBlock.getElementsByClassName("priority")[0];
            priority.innerHTML = animeItem.priority;
            priority.onclick = "setPriority("+animeItem.animeID+")";

            checkbox = animeBlock.getElementsByClassName("music-flag")[0];
            checkbox.checked = animeItem.music_flag;
            checkbox.onclick = "setMusicFlag(this,"+animeItem.animeID+")";

            episode = animeBlock.getElementsByClassName("episode")[0];
            episode.innerHTML = animeItem.episode;
            episode.onclick = "setEspisode(this,"+animeItem.animeID+")";

            if(wifi){
                animeBlock.getElementsByTagName("img")[0].src = animeItem.vision;
            }
            
            seasonNode = document.getElementById(animeItem.season);
            seasonNode.appendChild(document.createElement("hr"));
            seasonNode.appendChild(animeBlock);

            console.log("finish a node");
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