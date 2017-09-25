var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var sessionStore = new MongoStore({
	url: 'mongodb://localhost/bangumi_session'
})

var sessionMidware = session({
	secret:'ybExpressBangumi032',
	name: "bagumi",
	cookie: {path:'/bangumi',maxAge:3600000},
	resave: true,
	saveUninitialized: true,
	store: sessionStore
});

// module.exports = sessionMidware;
exports.midware = sessionMidware;
exports.sessionStore = sessionStore;