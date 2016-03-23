var express = require('express');
var morgan  = require('morgan');
var mysqlconn = require('./mysqlqueries.js');

var app = new express();
var port = process.env.PORT || 8080;
var publicDir = require('path').join(__dirname, '/public');

app.set('view engine','ejs');

mysqlconn.connect(function(connection){
    if(!connection)
        console.log("Not connected to mysqldb.");
});


//serve public dir
app.use(express.static(publicDir));

//List contributors
app.route('/contributors')
	.get(function(req,res){
            mysqlconn.logToDB(req.headers,"contributors"); //here is how clicks can be logged to db
            mysqlconn.getContributors(function(qr) {
                if(qr) {
                    res.status(200).render('contributors',{contributors:qr});
                } else {
                    res.status(201).send(null);                
                }
            });
	});
        
//respond to other requests
app.use(function(req, res){
  var data = '<h1>404</h1>';
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.end(data);
});

app.listen(port, function() {
    console.log("App is listening on port: " + port);
});

