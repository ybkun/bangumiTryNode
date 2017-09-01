var express = require('express');
var router = express.Router();
var bangumiController = require('../controller/bangumiController');
var loginController = require('../controller/loginController');
const checkOnce = require("../util/checkRequest").checkOnce;


router.get('/', 
    (req, res, next)=>{
        console.log("GET /bangumi");
        if(req.session.username || checkOnce(req.query)){
            next();
        }
        else{
            res.redirect('/bangumi/login');
        }
    },
    bangumiController.main
);

router.get('/login', (req,res)=>{
    console.log("GET /bangumi/login");
    if(req.session.username){
        return res.redirect('/bangumi');
    }
    res.render('login');
})

router.post('/login',loginController);
router.route('/').put(bangumiController.infobind)

module.exports = router;