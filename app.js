var express = require('express'),
    morgan  = require('morgan');
var app = new express(),
    port = process.env.PORT || 8080,
    publicDir = require('path').join(__dirname, '/public');

app.use(morgan('dev'));

var mysqlconn = require('./mysqlqueries.js');
mysqlconn.connect(function(connection){
    if(!connection)
        console.log("Not connected to mysqldb.");
});


//serve public dir
app.use(express.static(publicDir));

//respond to other requests
app.use(function(req, res){
  var data = '<h1>404</h1>';
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.end(data);
});

app.listen(port, function() {
    console.log("App is listening on port: " + port);
});

//List contributors
app.route('/contributors')
	.get(function(req,res){   
            mysqlconn.getContributors(function(qr) {
                if(qr)
                    res.status(200).json(qr);
                res.status(201).send(null);                
            });
	});