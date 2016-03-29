module.exports = {
  connection: null,
  pool : null,

connect : function(cbf){
  var mysql = require('mysql');
  var os = require("os");
  var hostname;
  var user;
  var password;
  if (this.startsWith(os.hostname(), "jallmer")) {
    hostname = "localhost";
    user = "root";
    password = "123456";
  } else {
    //hostname = "jlab.iyte.edu.tr";
    hostname = "10.2.24.19";
    user = "jlabweb";
    password = "j2016lab";
  }

  this.pool = mysql.createPool({
    host: hostname,
    user: user,
    password: password,
    database: "jlabweb"
  });
},


  getContributors: function(retfunc) {
    pool.getConnection(function(err, connection) {
      connection.query("SELECT * FROM contributors", function(err, rows, fields) {
        if (!err) {
          retfunc(rows);
        } else {
          retfunc(null);
        }
        connection.release();
      });
    });


    // this.connection.query('SELECT * FROM contributors', function(err, rows, fields) {
    //     if (!err) {
    //         retfunc(rows);
    //     } else
    //         retfunc(null);
    // });
  },

  startsWith: function(str, prefix) { // Not the right place for this function ... but for the time being ok.
    if (str.length < prefix.length)
      return false;
    for (var i = prefix.length - 1;
      (i >= 0) && (str[i] === prefix[i]); --i)
      continue;
    return i < 0;
  },

  logToDB: function(headers, page) {
    var insert = {};
    //console.log("Headers: " + JSON.stringify(headers));
    insert['IP'] = headers['host'];
    insert['sourcePage'] = headers['referer'] + "";
    insert['targetPage'] = page;
    insert['browser'] = headers['user-agent'];
    insert['language'] = headers['accept-language'];

    this.pool.getConnection(function(err, connection) {
      connection.query("INSERT INTO clickstats SET ?", insert, function(err, rows) {
        if (err) {
          console.log(err);
        }
        connection.release();
      });
    });

    // this.connection.query("INSERT INTO clickstats SET ?",insert,function(err,result) {
    //     if(err)
    //         console.log(err);
    // });
  },

  addPublication: function(bibtexEntry) {
    var insert = {};
    var fields = ["title", "author", "abstract", "journal", "publisher", "year", "month", "volume", "number", "pages", "keywords", "doi", "url", "pmid", "issn"];
    for (var key in bibtexEntry.entryTags) {

      if (fields.indexOf(key) < 0) {
        continue;
      }
      insert[key] = bibtexEntry.entryTags[key];
    }

    insert['type'] = bibtexEntry.entryType;

    this.pool.getConnection(function(err, connection) {
      connection.query("INSERT INTO Publications SET ?", insert, function(err, rows) {
        if (err) {
          console.log(err);
        }
        connection.release();
      });
    });

    // this.connection.query("INSERT INTO Publications SET ?", insert, function(err, result){
    //   if(err)
    //     console.log(err);
    // });
  }

};
