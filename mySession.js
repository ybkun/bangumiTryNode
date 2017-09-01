var session = require('express-session');

var sessionMidware = session({
  secret:'ybExpressWechat032',
  name: "bagumi",
  cookie: {path:'/bangumi',maxAge:3600000},
  resave: true,
  saveUninitialized: true
});

module.exports = sessionMidware;