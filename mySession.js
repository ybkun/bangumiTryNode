var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var sessionMidware = session({
  secret:'ybExpressBangumi032',
  name: "bagumi",
  cookie: {path:'/bangumi',maxAge:3600000},
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    url: 'mongodb://localhost/bangumi_session'
  })
});

module.exports = sessionMidware;