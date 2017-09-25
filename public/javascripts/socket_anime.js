var tabs = { // div in tab
    "fuyu" : document.getElementById("fuyu"),
    "haru" : document.getElementById("haru"),
    "natsu" : document.getElementById("natsu"),
    "aki" : document.getElementById("aki")
};
const SEASONS = {
    "fuyu": "冬",
    "haru": "春",
    "natsu": "夏",
    "aki": "秋"
}

var dt = new Date();
var selectedYear = dt.getFullYear();
var animeCache = {};
var socket;

var debugtemp;


function wait(){
    document.getElementById("alertMsg").innerHTML = "waiting...";
    $("#alertModal").modal("show");
}
function waitend(){
    $("#alertModal").modal("hide");
}
function modalAlert(msg){
    document.getElementById("alertMsg").innerHTML = msg;
    $("#alertModal").modal("show");
}

function logout(){
    socket.emit("user logout");
    window.location = "/bangumi/logout";
}

$(function(){    
    socket = io({
        query:{
            username: document.getElementById("username").innerHTML,
            once: document.getElementById("once").innerHTML
        }
    });
    
    socket.on("repeatedLogin",()=>{
        modalAlert("this account is logining from another divice");
        socket.close();
        window.location = 'bangumi/login';
    })

    socket.on("disconnect",(reason)=>{
        alert("disconnect with server for "+reason);
    });

    socket.on("client init", (animeList, wifi)=>{
        putupAnime(tabs, animeList, wifi).then((value)=>{waitend()});
    });

    socket.on("reconnect",(attemptNum)=>{
        console.log("reconnect: ",attemptNum)
    });

    socket.on("year response", (animeList, wifi)=>{
        clearTabs(()=>{putupAnime(tabs, animeList,wifi);});
        waitend();
    });

    socket.on("search response",(animeList, wifi)=>{ /** animeList only contents animes not in user watch list */
        console.log("get search response: ",animeList)
        var modalBodyDOM = document.getElementById("myModalBody");
        var animeItem;
        var animeBlock;
        var seasonFlag;
        modalBodyDOM.innerHTML="";
        for(var index in animeList){
            animeItem = animeList[index];
            if(seasonFlag !== animeItem.season){
                modalBodyDOM.appendChild(document.createElement("hr"));
                seasonFlag = animeItem.season;
            }
            animeBlock = document.getElementById("animeAdd").cloneNode(true);
            animeBlock.setAttribute("id",animeItem.animeID);
            animeBlock.getElementsByClassName("anime-title")[0].innerHTML = animeItem.title;
            animeBlock.getElementsByClassName("description")[0].innerHTML = animeItem.description;
            animeBlock.getElementsByClassName("season")[0].innerHTML = SEASONS[animeItem.season];
            if(wifi){
                animeBlock.getElementsByTagName("img")[0].src = animeItem.vision;
            }
            
            // set add button here
            animeBlock.getElementsByClassName("animeAdd2Watch")[0].setAttribute("onclick", "add2watch(this)")

            modalBodyDOM.appendChild(animeBlock);
        }
        waitend();
        $("#animeAddModal").modal("show");
    });
    socket.on("add2watch fail",(animeID)=>{
        waitend();
        var failedNode = document.getElementById(animeId);
        failedNode.getElementsByClassName("animeAdd2Watch")[0].disabled = false;
        var title = failedNode.getElementsByClassName("anime-title")[0].innerHTML;
        alert("add anime failed: "+title);
    });
    socket.on("add2watch success",(res)=>{
        console.log("add2watch success: ",res)
        console.log(animeCache)
        var resyear = res[0].year
        if(animeCache[resyear]){
            var yearnow = selectedYear;
            selectYear(resyear, ()=>{
                // after resume
                putupAnime(tabs,res,false,()=>{console.log("putupAnime end")});
            });
            selectYear(yearnow);
        }
        waitend();
    });


})

function add2watch(button_add2watch){
    button_add2watch.disabled = true;
    wait();
    // debugtemp = button_add2watch;
    var animeNode = getAncestor(button_add2watch,9); // warning: need change with html structure
    var animeID = animeNode.getAttribute("id");
    socket.emit("add2watch", animeID);
}

function getBlankAnimeNode(){
    return new Promise(function(resovle,reject){
        resovle(document.getElementById("animeNodeTemp").cloneNode(true))
    });
}


async function putupAnime(tabs, animeList, wifi, callback){
    var animeItem;
    var animeBlock;

    if(!(callback instanceof Function)){
        callback = ()=>{};
    }
    
    for(var index in animeList){
        animeItem = animeList[index];

        animeBlock = await getBlankAnimeNode();
        animeBlock.setAttribute("id",animeItem.animeID);
        animeBlock.getElementsByClassName("anime-title")[0].innerHTML = animeItem.title;
        animeBlock.getElementsByClassName("description")[0].innerHTML = animeItem.description;

        animeBlock.getElementsByClassName("season")[0].innerHTML = SEASONS[animeItem.season];

        animeBlock.getElementsByClassName("priority")[0].innerHTML = animeItem.priority;;
        animeBlock.getElementsByClassName("priority")[0].setAttribute("onclick", "setPriority(this,"+animeItem.animeID+")");
        
        animeBlock.getElementsByClassName("music-flag")[0].checked = animeItem.music_flag;
        animeBlock.getElementsByClassName("music-flag")[0].setAttribute("onclick", "setMusicFlag(this,"+animeItem.animeID+")");

        animeBlock.getElementsByClassName("episode")[0].innerHTML = animeItem.episode;
        animeBlock.getElementsByClassName("episode")[0].setAttribute("onclick", "setEpisode("+animeItem.animeID+")");

        animeBlock.getElementsByClassName("episodeDown")[0].setAttribute("onclick", "episodeButton("+animeItem.animeID+",-1)");
        animeBlock.getElementsByClassName("episodeUp")[0].setAttribute("onclick", "episodeButton("+animeItem.animeID+",1)");

        if(wifi){
            animeBlock.getElementsByTagName("img")[0].src = animeItem.vision;
        }
        
        tabs[animeItem.season].appendChild(document.createElement("hr"));
        tabs[animeItem.season].appendChild(animeBlock);

    }
    storeInCache(selectedYear,callback);
}

/**
 * keep the div in tab
 */
function clearTabs(callback){
    for(var key in tabs){
        tabs[key].innerHTML = "";
    }
    setTimeout(callback,0);
}

function storeInCache(year, callback){
    delete animeCache[year];
    animeCache[year] = {
        fuyu: tabs.fuyu.innerHTML,
        haru: tabs.haru.innerHTML,
        natsu: tabs.natsu.innerHTML,
        aki: tabs.aki.innerHTML
    };
    callback();
}

function resumeFromCache(year, callback){
    for(var key in tabs){
        tabs[key].innerHTML = animeCache[year][key];
    }
    callback();
}

function _setEpisode_cluser(){
    let optList = {};
    return function _setEpisode_inside(animeID, episode){
        if(episode<0) return false;
        optList[animeID] = optList[animeID]? optList[animeID]:{};
        var oldTimer = optList[animeID].timer;
        if(oldTimer){
            clearTimeout(oldTimer);
        }
        optList[animeID].timer = setTimeout(()=>{
            socket.emit("set episode", animeID, episode);
            delete optList[animeID];
        },2000);
        optList[animeID].episode = episode;
    }
}
let _setEpisode = _setEpisode_cluser();

function setEpisode(animeID){
    var animeBlock = document.getElementById(animeID);
    var originEpisode =  animeBlock.getElementsByClassName("episode")[0].innerHTML;
    var newEpisode = prompt("input a number",originEpisode)-0;
    if(newEpisode && newEpisode>0){
        _setEpisode(animeID,newEpisode);
        animeBlock.getElementsByClassName("episode")[0].innerHTML = newEpisode;
    }
    else{
        alert("your input is not a number")
    }
}

function episodeButton(animeID, variation){
    var animeBlock = document.getElementById(animeID);
    var originEpisode = animeBlock.getElementsByClassName("episode")[0].innerHTML - 0;
    var newEpisode = Math.floor(originEpisode+variation);
    if(newEpisode<0) return false;
    animeBlock.getElementsByClassName("episode")[0].innerHTML = newEpisode;
    _setEpisode(animeID, newEpisode);
}

function _setMusicFlag_cluser(){
    let optList={};
    return function _setMusicFlag_inside(checkbox, animeID){
        optList[animeID] = optList[animeID]? optList[animeID]:{};
        var oldTimer = optList[animeID].timer;
        if(oldTimer){
            clearTimeout(oldTimer);
        }
        optList[animeID].timer = setTimeout(()=>{
            socket.emit("set music", animeID, checkbox.checked);
            delete optList[animeID];
        },2000);
    }
}
let setMusicFlag = _setMusicFlag_cluser();

function _setPriority_cluser(){
    let optList={};
    return function _setMusicFlag_inside(a,animeID){
        var priority = Math.floor(prompt("set priority"));
        if(!(priority>0 && priority<=10)){
            return alert("input is not a valid number(1~10)");
        }
        optList[animeID] = optList[animeID]? optList[animeID]:{};
        var oldTimer = optList[animeID].timer;
        if(oldTimer){
            clearTimeout(oldTimer);
        }
        optList[animeID].timer = setTimeout(()=>{
            socket.emit("set priority", animeID, priority);
            delete optList[animeID];
        },2000);
        a.innerHTML = priority;
    }
}
let setPriority = _setPriority_cluser();

// callback works only in resumeFromCache or year didn't change
function selectYear(year, callback){
    if(!(callback instanceof Function)){
        callback = ()=>{};
    }
    if(year == selectedYear){
        callback();
        return true;
    }
    var before = selectedYear;
    selectedYear = year;
    
    storeInCache(before, ()=>{
        if(animeCache[year]){
            console.log("has cache: ",year);
            resumeFromCache(year, callback);
        }
        else{
            console.log("no cache: ",year);
            socket.emit("year require", year);
            wait();
        }
    });
    document.getElementById(before).removeAttribute("class");
    document.getElementById(year).setAttribute("class","active");
}

function searchAnime(){
    wait();
    var title = $("#searchTitle").val();
    var year = $("#searchYear").val()-0;
    if(!(title || year)){
        return modalAlert("can't search with empty/illegle options");
    }
    socket.emit("search anime",title,year);
    console.log("search: ",title,year);
}


function getAncestor(node,distance){
    var ret=node;
    distance-=0;
    if(!(distance && distance>0)){
        return false;
    }
    for(var i=0;i<distance;i++){
        ret = ret.parentNode;
    }
    return ret;
}