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
        console.log("Event: client init");
        console.log(animeList);

        putupAnime(animeList, wifi);
    });

    socket.on("reconnect",(attemptNum)=>{
        console.log("reconnect: ",attemptNum)
    });

    socket.on("year response", (animeList, wifi)=>{
        console.log("year response",animeList);
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
    var priority;
    var checkbox;
    var episode;

    var seasonNode;
    
    for(var index in animeList){
        animeItem = animeList[index];
        
        console.log("handling ",animeItem);

        animeBlock = await getBlankAnimeNode();
        animeBlock.setAttribute("id",animeItem.animeID);
        animeBlock.getElementsByClassName("anime-title")[0].innerHTML = animeItem.title;
        animeBlock.getElementsByClassName("description")[0].innerHTML = animeItem.description;

        animeBlock.getElementsByClassName("priority")[0].innerHTML = animeItem.priority;;
        animeBlock.getElementsByClassName("priority")[0].onclick = "setPriority("+animeItem.animeID+")";
        
        animeBlock.getElementsByClassName("music-flag")[0].checked = animeItem.music_flag;
        animeBlock.getElementsByClassName("music-flag")[0].onclick = "setMusicFlag(this,"+animeItem.animeID+")";

        animeBlock.getElementsByClassName("episode")[0].innerHTML = animeItem.episode;
        animeBlock.getElementsByClassName("episode")[0].onclick = "setEspisode(this,"+animeItem.animeID+")";

        if(wifi){
            animeBlock.getElementsByTagName("img")[0].src = animeItem.vision;
        }
        
        tabs[animeItem.season].appendChild(document.createElement("hr"));
        tabs[animeItem.season].appendChild(animeBlock);

        console.log("finish a node");
    }
    console.log("putupAnime end");
    storeInCache(selectedYear)
    console.log("after storeInCache")
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
    console.log("call storeInCache")
    delete animeCache[year];
    animeCache[year] = {
        fuyu: tabs.fuyu.innerHTML,
        haru: tabs.haru.innerHTML,
        natsu: tabs.natsu.innerHTML,
        aki: tabs.aki.innerHTML
    };
    console.log("end of storeInCache")
}

/**
 * 
 * @param {Number} year
 * 
 * remove div then append div in cache 
 */
function resumeFromCache(year){
    for(var key in tabs){
        tabs[key].innerHTML = animeCache[year][key];
        // tabs[key].appendChild(animeCache[year][key]);
    }
}

function episodeAdd(year,animeID){}

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