var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash  = require('connect-flash');
var session  = require('express-session');
var path  = require('path');

require('./config/passport')(passport);
var routes = require('./routes/index')(passport);
var users = require('./routes/users');
var nodes = require('./routes/nodes');
var admin = require('./routes/admin');

var app = express();

var server = require('http').Server(app);  
var io = require('socket.io')(server);
var self = this;
var socket;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next){
  res.io = io;
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// required for passport
app.use(session({ secret: 'smartparkingserver' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/', routes);
app.use('/users', users);
app.use('/api/v1', nodes);
app.use('/admin', admin);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  //next(err);
  res.status(404);
  res.render('error', { status: 404, url: req.url });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var node  = require('./models/node/nodeModel');

var places = [
    {
      lat:7.255209,
      lng:80.592715,
      name:"E-Fac (near the new chemical building)",
      numOfSlots:20,
      availableSlots:5,
      prkType:"Indoor"
    },{
      lat:7.252603,
      lng:80.591643,
      name:"E-Fac (near the faculty canteen)",
      numOfSlots:12,
      availableSlots:3,
      prkType:"Indoor"
    },{
      lat:7.254319,
      lng:80.596698,
      name:"Senate 01",
      numOfSlots:30,
      availableSlots:9,
      prkType:"Outdoor"
    },{
      lat:7.254032,
      lng:80.596922,
      name:"Senate 02",
      numOfSlots:10,
      availableSlots:2,
      prkType:"Outdoor"
    },{
      lat:7.259352,
      lng:80.599135,
      name:"Science",
      numOfSlots:7,
      availableSlots:1,
      prkType:"Outdoor"
    },{
      lat:7.253579,
      lng:80.598277,
      name:"Medicine",
      numOfSlots:14,
      availableSlots:6,
      prkType:"Indoor"
    }
];

io.sockets.on("connection", function (socket) {
  console.log("new user connected");
  self.socket = socket.emit;
  socket.emit("new-client",places);
    require("./routes/mqtt-client")(socket);
});



//var bcrypt   = require('bcrypt-nodejs');
//console.log(bcrypt.hashSync("123456", bcrypt.genSaltSync(8), null));

module.exports = {app:app,server:server,io:io};
