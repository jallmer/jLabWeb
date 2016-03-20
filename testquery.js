var mysql      = require('mysql');

/*
 * This needs to be replaced with the connection to our mysql database in production.
 */
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'webdb'
});
connection.connect();

var queries = require('./mysqlqueries.js');
queries.getContributors(connection,function(qr) {
    console.log(qr);
    if(qr)
        console.log(qr);
    else
        console.log("Problem");    
});


//
////List contributors
//app.route('/contributors')
//	.get(function(req,res){            
//            var qr = queries.getContributors(connection);
//            if(qr)
//                res.status(200).json(qr);
//            res.status(201).send(null);
//	});

connection.end();
