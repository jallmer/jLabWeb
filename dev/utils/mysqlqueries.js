module.exports = {
   connection: null,
   pool: null,

   connect: function(cbf) {
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
      this.pool.getConnection(function(err, connection) {
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

   },

   addAuthorship : function(autId, pubId){
      var insert = {};
      insert["autId"] = autId;
      insert["pubId"] = pubId;
      this.pool.getConnection(function(err, connection){
         connection.query("INSERT INTO Authorship SET ?", insert, function(err, rows){
            if(err){
               console.log(err);
            }
         });
         connection.release();
      });
   },

   addAuthor : function(names, pubId){
      var insert = {};
      insert["lname"] = names[0];
      insert["fname"] = names[1].split(" ")[0];
      var mnames = "";
      for(var i = 1; i < names[1].split(" ").length; i++){
         mnames += names[1].split(" ")[i] + " ";
      }
      insert["mnames"] = mnames;
      this.pool.getConnection(function(err, connection){
         connection.query("INSERT INTO Persons SET ?", insert, function(err, rows){
            if(err){
               console.log(err);
            }
            console.log(names[0] + " inserted into table with ID: " + rows.insertId);
            var mysqlconn = require('./mysqlqueries.js');
            mysqlconn.addAuthorship(rows.insertId, pubId);
         });
         connection.release();
      });
   },

   checkAutExists: function(names, pubId){
      autId = 0;
      this.pool.getConnection(function(err, connection) {

         connection.query("SELECT * FROM Persons WHERE lname = '" + names[0] + "'", function(err, rows) {
            if(err){
               console.log(err);
            }
            var autId = 0;
            if(rows.length > 0){
               autId = rows[0].ID;
               console.log(names[0] + " exists with ID: " + autId);
               var mysqlconn = require('./mysqlqueries.js');
               mysqlconn.addAuthorship(autId, pubId);
            }else{
               autId = -1;
               console.log(names[0] + " doesn't exist");
               var mysqlconn = require('./mysqlqueries.js');
               mysqlconn.addAuthor(names, pubId);
            }
         });
         connection.release();
      });
   },

   associateAuthors: function(bibtexEntry, pubId) {
      console.log(bibtexEntry.entryTags["author"]);
      var authors = bibtexEntry.entryTags["author"].split(" and ");
      for (var i = 0; i < authors.length; i++) {
         var names = authors[i].split(", ");
         console.log(names[0]);
         var mysqlconn = require('./mysqlqueries.js');
         mysqlconn.checkAutExists(names, pubId);
      }
   },

   addPublication: function(bibtexEntry) {
      console.log("deneme");
      var insert = {};
      var fields = ["title", "author", "abstract", "journal", "publisher", "year", "month", "volume", "number", "pages", "keywords", "doi", "url", "pmid", "issn"];
      for (var key in bibtexEntry.entryTags) {
         if (fields.indexOf(key) < 0) {
            continue;
         }
         bibtexEntry.entryTags[key] = bibtexEntry.entryTags[key].replace("{\c{c}}/g", "ç").replace("{\"{o}}", "ö").replace("{\"{u}}", "ü");
         insert[key] = bibtexEntry.entryTags[key];
      }
      insert['type'] = bibtexEntry.entryType;

      pubId = 0;
      this.pool.getConnection(function(err, connection) {
         connection.query("INSERT INTO Publications SET ?", insert, function(err, rows) {
            if (err) {
               console.log(err);
            }
            pubId = rows.insertId;
            var mysqlconn = require('./mysqlqueries.js');
            mysqlconn.associateAuthors(bibtexEntry, pubId);
         });
         connection.release();
      });
   }
};
