var express = require('express');
var morgan  = require('morgan');
var mysqlconn = require('./mysqlqueries.js');
var ejs = require("ejs");

var app = new express();
var port = process.env.PORT || 8080;
var publicDir = require('path').join(__dirname, '/public');

app.set('view engine','ejs');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

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

app.route('/posters')
	.get(function(req,res){
            mysqlconn.logToDB(req.headers,"posters");
            res.status(200).render('posters',{title:"jLab Posters",active:"posters"});
	});

//respond to other requests
app.use(function(req, res){
    mysqlconn.logToDB(req.headers,"404");
    res.status(404).render('404');
});

app.listen(port, function() {
    console.log("App is listening on port: " + port);
});

