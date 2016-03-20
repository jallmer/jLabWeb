module.exports = {
    connection: null,
    
    connect: function(cbf) {
        var mysql      = require('mysql');
        /*
         * This needs to be replaced with the connection to our mysql database in production.
         */
        this.connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : '123456',
          database : 'webdb'
        });
        this.connection.connect();
        cbf(this.connection);
    },
    
    disconnect: function() {
        this.connection.end();  
    },
    
    getContributors: function(retfunc) {
        this.connection.query('SELECT * FROM contributors', function(err, rows, fields) {
            if (!err) {
                //console.log(rows);
                retfunc(rows);
            } else
                retfunc(null);
        });        
    }
    
};

