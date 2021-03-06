var express = require('express');
var router = express.Router();
var bangumiController = require('../controller/bangumiController');
var loginController = require('../controller/loginController');
const checkOnce = require("../util/checkRequest").checkOnce;


router.get('/', 
    (req, res, next)=>{
        // console.log("GET /bangumi");
        if(req.session.username || checkOnce(req.query.user, req.query.once)){
            next();
        }
        else{
            res.redirect('/bangumi/login');
        }
    },
    bangumiController.main
);

router.get('/login', (req,res)=>{
    // console.log("GET /bangumi/login");
    if(req.session.username){
        return res.redirect('/bangumi');
    }
    res.render('login');
})

router.get('/logout',(req,res)=>{
    console.log(req.session)
    if(!req.session.username){
        return res.status(500).send('Not Acceptable');
    }
    var uname = req.session.username;
    req.session.destroy((err)=>{
        if(err){
            console.error("session logout error when logout: ",err);
        }
        else{
            console.log("session destroyed: ", uname);
        }
    });
    res.send("logout succeed");
})

router.post('/login',loginController);
router.post('/bind',bangumiController.infobind)

module.exports = router;