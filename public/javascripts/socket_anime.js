var socket = io();
var dt = new Date();
var selectedYear = dt.getFullYear();


socket.on('connect', ()=>{
    socket.emit("req init")

});

socke.on("res to year change", ()=>{

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