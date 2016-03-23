module.exports = {
    connection: null,
    
    connect: function(cbf) {
        var mysql      = require('mysql');
        /*
         * This needs to be replaced with the connection to our mysql database in production.
         */
        var os = require("os");
        var hostname;
        var user;
        var password;
        if(this.startsWith(os.hostname(),"jallmer")) {
            hostname = "localhost";
            user = "root";
            password = "123456";
        } else {
            hostname = "jlab.iyte.edu.tr";
            user = "root";
            password = "123456";
        }
        this.connection = mysql.createConnection({
          host     : hostname,
          user     : user,
          password : password,
          database : 'jlabweb'
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
                retfunc(rows);
            } else
                retfunc(null);
        });        
    },
    
    startsWith: function(str, prefix) { // Not the right place for this function ... but for the time being ok.
        if (str.length < prefix.length)
            return false;
        for (var i = prefix.length - 1; (i >= 0) && (str[i] === prefix[i]); --i)
            continue;
        return i < 0;
    },
    
    logToDB: function(headers,page) {
        var insert = {};
        //console.log("Headers: " + JSON.stringify(headers));
        insert['IP'] = headers['host'];
        insert['sourcePage'] = headers['referer']+"";
        insert['targetPage'] = page;
        insert['browser'] = headers['user-agent'];
        insert['language'] = headers['accept-language'];
        this.connection.query("INSERT INTO clickstats SET ?",insert,function(err,result) {
            if(err)
                console.log(err);
        });
    }    
};

