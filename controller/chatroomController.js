

module.exports = function (req,res){
    console.log("call caht room");
    res.locals.title = 'a title';
    res.locals.h1 = 'main body'
    res.render("index")
};