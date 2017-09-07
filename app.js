var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('./logger');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessionMidware = require('./mySession');
var http = require('http');

var index = require('./routes/index');
var bangumi = require('./routes/bangumi');

const checkRequest = require("./util/checkRequest");
const checkOnce = checkRequest.checkOnce;

var app = express();

// let local_req;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon_B.ico')));
app.use(logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMidware);

app.use(function(req,res,next){
    local_req=req;
    next();
})

app.use('/', index);
app.use('/bangumi',bangumi)
app.use(express.static('public'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

var server = http.createServer(app);
var io = require('socket.io')(server);
// var io = require('./SIO')(server);

// socket.io

// 
io.use(function(socket,next){
    sessionMidware(socket.request, socket.request.res, next);
});
// console.log(io)

// var BIO = io.of('/bangumi');

io.on("connection", (socket)=>{
    console.log("new connection:", socket.id)
    // console.warn("req:",local_req,socket.request)
    // console.warn("IO:",socket.request)
    socket.on("check once", (uname,once)=>{
        if(!checkOnce(uname,once)){
            socket.disconnect(true);
        }
    })
    socket.on('disconnect', ()=>{
        console.log("%s disconnect with socket",socket.id)
    });
    socket.on('req init',()=>{
        console.log("user require init page\n")
    });
});


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);




function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  // debug('Listening on ' + bind);
  console.log('Listening on ' + bind);
}