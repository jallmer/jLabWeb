var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var publications = require('./routes/publications');
var staff = require('./routes/staff');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//For render .html files
app.engine('.html', require('ejs').renderFile);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('short',{
//   "stream" : {
//       write: function(str) {
//           console.log(str);
//       }
//   }
//
//}));

app.use(logger(format({
    responseTime: ':response-time',
    IP: ':remote-addr',
    //remote_user: ':remote-user',
    status: ':status',
    targetPage: ':url',
    requestTime: ':date[iso]',
    sourcePage: ':referrer',
    browser: ':user-agent'
            //type : function (req, res) { return req.headers;}
            // etc.; any non-standard tokens you would have to implement
})));

function format(obj) {
    var keys = Object.keys(obj);
    var token = /^:([-\w]{2,})(?:\[([^\]]+)\])?$/;
    return function (tokens, req, res) {
        var data = {};
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = token.exec(obj[key]);
            data[key] = val !== null
                    ? tokens[val[1]](req, res, val[2])
                    : obj[key];
        }
        var mysqlconn = require("./dev/utils/mysqlqueries.js");
        mysqlconn.logToDB(data);
        //console.log(JSON.stringify(data, null, 4));
    };
}
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Serve static files in Public directory
app.use(express.static(__dirname + '/public'));

app.use('/', routes);
app.use('/publications', publications);
app.use('/staff', staff);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// var proxy = require('express-http-proxy');
//
// app.use('/proxy', proxy('10.2.30.139:80', {
//       forwardPath: function(req, res){
//          console.log("forwarding");
//          return require('url').parse(req.url).path;
//       }
// }));

module.exports = app;
