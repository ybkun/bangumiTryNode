var tabs = { // div in tab
    "fuyu" : document.getElementById("fuyu"),
    "haru" : document.getElementById("haru"),
    "natsu" : document.getElementById("natsu"),
    "aki" : document.getElementById("aki")
};

var dt = new Date();
var selectedYear = dt.getFullYear();

var animeCache = {};
var socket;

$(function(){    
    socket = io({
        query:{
            username: document.getElementById("username").innerHTML,
            once: document.getElementById("once").innerHTML
        }
    });
    
    socket.on("disconnect",(reason)=>{
        alert("disconnect with server for "+reason);
    });

    socket.on("client init", (animeList, wifi)=>{
        putupAnime(animeList, wifi);
    });

    socket.on("reconnect",(attemptNum)=>{
        console.log("reconnect: ",attemptNum)
    });

    socket.on("year response", (animeList, wifi)=>{
        clearTabs(()=>{putupAnime(animeList,wifi);});
        
    });

})

function getBlankAnimeNode(){
    return new Promise(function(resovle,reject){
        resovle(document.getElementById("animeNodeTemp").cloneNode(true))
    });
}

// function getSeasonNdoe(season, callback){
//     callback(tabs[season][0])
// }

async function putupAnime(animeList, wifi, callback){
    var animeItem;
    var animeBlock;
    // var priority;
    // var checkbox;
    // var episode;
    // var seasonNode;
    
    for(var index in animeList){
        animeItem = animeList[index];

        animeBlock = await getBlankAnimeNode();
        animeBlock.setAttribute("id",animeItem.animeID);
        animeBlock.getElementsByClassName("anime-title")[0].innerHTML = animeItem.title;
        animeBlock.getElementsByClassName("description")[0].innerHTML = animeItem.description;

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
    storeInCache(selectedYear)
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

function storeInCache(year){
    delete animeCache[year];
    animeCache[year] = {
        fuyu: tabs.fuyu.innerHTML,
        haru: tabs.haru.innerHTML,
        natsu: tabs.natsu.innerHTML,
        aki: tabs.aki.innerHTML
    };
}

function resumeFromCache(year){
    for(var key in tabs){
        tabs[key].innerHTML = animeCache[year][key];
        // tabs[key].appendChild(animeCache[year][key]);
    }
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

function selectYear(year){
    var before = selectedYear;
    selectedYear = year;
    
    storeInCache(before);
    if(animeCache[year]){
        console.log("has cache: ",year);
        resumeFromCache(year);
    }
    else{
        console.log("no cache: ",year);
        socket.emit("year require", year);
    }

    document.getElementById(before).removeAttribute("class");
    document.getElementById(year).setAttribute("class","active");
}