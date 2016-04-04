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

   addAuthorship: function(autId, pubId) {
      var insert = {};
      insert["autId"] = autId;
      insert["pubId"] = pubId;
      this.pool.getConnection(function(err, connection) {
         connection.query("INSERT INTO Authorship SET ?", insert, function(err, rows) {
            if (err) {
               console.log(err);
            }
         });
         connection.release();
      });
   },

   addAuthor: function(names, pubId) {
      var insert = {};
      insert["lname"] = names[0];
      insert["fname"] = names[1].split(" ")[0];
      var mnames = "";
      for (var i = 1; i < names[1].split(" ").length; i++) {
         mnames += names[1].split(" ")[i] + " ";
      }
      insert["mnames"] = mnames;
      this.pool.getConnection(function(err, connection) {
         connection.query("INSERT INTO Persons SET ?", insert, function(err, rows) {
            if (err) {
               console.log(err);
            }
            console.log(names[0] + " inserted into table with ID: " + rows.insertId);
            var mysqlconn = require('./mysqlqueries.js');
            mysqlconn.addAuthorship(rows.insertId, pubId);
         });
         connection.release();
      });
   },

   checkAutExists: function(names, pubId) {
      autId = 0;
      this.pool.getConnection(function(err, connection) {

         connection.query("SELECT * FROM Persons WHERE lname = '" + names[0] + "'", function(err, rows) {
            if (err) {
               console.log(err);
            }
            var autId = 0;
            if (rows.length > 0) {
               autId = rows[0].ID;
               var mysqlconn = require('./mysqlqueries.js');
               mysqlconn.addAuthorship(autId, pubId);
            } else {
               autId = -1;
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

   //NOT WORKING atm
   updatePublication: function(bibtexEntry) {
      console.log("updating");
      var insert = {};
      var fields = ["title", "author", "abstract", "journal", "publisher", "year", "month", "volume", "number", "pages", "keywords", "doi", "url", "pmid", "issn"];
      for (var key in bibtexEntry.entryTags) {
         if (fields.indexOf(key) < 0) {
            continue;
         }
         //bibtexEntry.entryTags[key] = bibtexEntry.entryTags[key].replace(new RegExp('{\\c{c}}', 'g'), 'ç').replace(new RegExp("{\\\"{u}}", 'g'), 'ü').replace(new RegExp('\\"{o}}', 'g'), 'ö');
         var mysqlconn = require('./mysqlqueries.js');
         bibtexEntry.entryTags[key] = mysqlconn.replaceAll(bibtexEntry.entryTags[key], "{\\c{c}}", "ç");
         bibtexEntry.entryTags[key] = mysqlconn.replaceAll(bibtexEntry.entryTags[key], "{\\\"{u}}", "ü");
         bibtexEntry.entryTags[key] = mysqlconn.replaceAll(bibtexEntry.entryTags[key], "{\\\"{o}}", "ö");
         insert[key] = bibtexEntry.entryTags[key];
      }
      insert['type'] = bibtexEntry.entryType;

      pubId = 0;
      this.pool.getConnection(function(err, connection) {
         connection.query("UPDATE Publications SET ? WHERE title = " + insert["title"], insert, function(err, rows) {
            if (err) {
               console.log(err);
            }
         });
         connection.release();
      });
   },

   escapeRegExp: function(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
   },

   replaceAll: function(str, find, replace) {
      var mysqlconn = require('./mysqlqueries.js');
      return str.replace(new RegExp(mysqlconn.escapeRegExp(find), 'g'), replace);
   },

   insertPublication: function(bibtexEntry) {
      var insert = {};
      var fields = ["title", "author", "abstract", "journal", "publisher", "year", "month", "volume", "number", "pages", "keywords", "doi", "url", "pmid", "issn"];
      for (var key in bibtexEntry.entryTags) {
         if (fields.indexOf(key) < 0) {
            continue;
         }
         //bibtexEntry.entryTags[key] = bibtexEntry.entryTags[key].replace(new RegExp('{\\c{c}}', 'g'), 'ç').replace(new RegExp("{\\\"{u}}", 'g'), 'ü').replace(new RegExp('\\"{o}}', 'g'), 'ö');
         var mysqlconn = require('./mysqlqueries.js');
         bibtexEntry.entryTags[key] = mysqlconn.replaceAll(bibtexEntry.entryTags[key], "{\\c{c}}", "ç");
         bibtexEntry.entryTags[key] = mysqlconn.replaceAll(bibtexEntry.entryTags[key], "{\\\"{u}}", "ü");
         bibtexEntry.entryTags[key] = mysqlconn.replaceAll(bibtexEntry.entryTags[key], "{\\\"{o}}", "ö");
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
      return pubId;
   },

   addPublication: function(bibtexEntry){
      this.pool.getConnection(function(err, connection){
         connection.query("SELECT * FROM Publications WHERE title = \"" + bibtexEntry.entryTags["title"] + "\"", function(err, rows){
            if(err){
               console.log(err);
            }
            var mysqlconn = require('./mysqlqueries.js');
            if(rows.length > 0){
               console.log(bibtexEntry.entryTags["title"] + " exists. Skipping");
            }else{
               var pubId = mysqlconn.insertPublication(bibtexEntry);
               console.log(pubId);
            }
         });
      });
   }
};
