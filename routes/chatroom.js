var express = require('express');
var router = express.Router();
var chatroomController = require('../controller/chatroomController')

router.get('/', chatroomController);

module.exports = router;