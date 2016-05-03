module.exports = {
   connection: null,
   pool: null,

   connect: function(cbf) {
      var mysql = require('mysql');
      var os = require("os");
      var hostname;
      var user;
      var password;
      var stringutils = require('./stringutils.js');
      if (stringutils.startsWith(os.hostname(), "jallmer")) {
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

   disconnect: function(cbf){
      this.pool.end(function(err){
         if(err){
            console.log(err);
         }
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



   logToDB: function(data) {
       var insert = {};
       var keys = Object.keys(data);
       var fields = ["requestTime", "targetPage", "sourcePage", "status", "responseTime", "IP", "browser"];
       for(var i = 0; i < keys.length; i++){
           if(fields.indexOf(keys[i]) < 0)
               continue;
            insert[keys[i]] = data[keys[i]];
       }
      this.pool.getConnection(function(err, connection) {
         connection.query("INSERT INTO clickstats SET ?", insert, function(err, rows) {
            if (err) {
               console.log(err.message);
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
            connection.release();
         });
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
            connection.release();
         });
      });
   },

   checkAutExists: function(names, pubId) {
      autId = 0;
      this.pool.getConnection(function(err, connection) {

         connection.query("SELECT * FROM Persons WHERE lname LIKE '" + names[0] + "%'", function(err, rows) {
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
            connection.release();
         });
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
         var stringutils = require('./stringutils.js');
         bibtexEntry.entryTags[key] = stringutils.replaceAll(bibtexEntry.entryTags[key], "{\\c{c}}", "ç");
         bibtexEntry.entryTags[key] = stringutils.replaceAll(bibtexEntry.entryTags[key], "{\\\"{u}}", "ü");
         bibtexEntry.entryTags[key] = stringutils.replaceAll(bibtexEntry.entryTags[key], "{\\\"{o}}", "ö");
         insert[key] = bibtexEntry.entryTags[key];
      }
      insert['type'] = bibtexEntry.entryType;

      pubId = 0;
      this.pool.getConnection(function(err, connection) {
         connection.query("UPDATE Publications SET ? WHERE title = " + insert["title"], insert, function(err, rows) {
            if (err) {
               console.log(err);
            }
            connection.release();
         });
      });
   },

   insertPublication: function(bibtexEntry) {
      var insert = {};
      var fields = ["title", "author", "abstract", "journal", "publisher", "year", "month", "volume", "number", "pages", "keywords", "doi", "url", "pmid", "issn"];
      for (var key in bibtexEntry.entryTags) {
         if (fields.indexOf(key) < 0) {
            continue;
         }
         //bibtexEntry.entryTags[key] = bibtexEntry.entryTags[key].replace(new RegExp('{\\c{c}}', 'g'), 'ç').replace(new RegExp("{\\\"{u}}", 'g'), 'ü').replace(new RegExp('\\"{o}}', 'g'), 'ö');
         var stringutils = require('./stringutils.js');
         bibtexEntry.entryTags[key] = stringutils.replaceAll(bibtexEntry.entryTags[key], "{\\c{c}}", "ç");
         bibtexEntry.entryTags[key] = stringutils.replaceAll(bibtexEntry.entryTags[key], "{\\\"{u}}", "ü");
         bibtexEntry.entryTags[key] = stringutils.replaceAll(bibtexEntry.entryTags[key], "{\\\"{o}}", "ö");
         insert[key] = bibtexEntry.entryTags[key];
      }
      bibtexEntry.entryTags["title"] = stringutils.replaceAll(bibtexEntry.entryTags["title"], "{", "");
      bibtexEntry.entryTags["title"] = stringutils.replaceAll(bibtexEntry.entryTags["title"], "}", "");
      insert["title"] = bibtexEntry.entryTags["title"];
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
            connection.release();
         });
      });
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
               mysqlconn.insertPublication(bibtexEntry);
            }
            connection.release();
         });
      });
   },

   logToMirnaLog: function(runId, email, ip, time){
      var insert = {};
      insert["runId"] = runId;
      insert["email"] = email;
      insert["ip"] = ip;
      insert["time"] = time;
      this.pool.getConnection(function(err, connection){
         connection.query("INSERT INTO mirnaLog SET ?", insert, function(err, rows){
            if(err){
               console.log(err);
            }
            connection.release();
         });
      });
   },

   getMirnaRunTimes: function(email, ip, time, runId, response){
      this.pool.getConnection(function(err, connection){
         connection.query("SELECT COUNT(email) as emailCount, COUNT(ip) as ipCount FROM mirnaLog WHERE time = '" + time + "' AND ip = '" + ip + "' AND email = '" + email + "'", function(err, rows){
            if(err){
               console.log(err);
            }
            var mirnaFeatCalc = require("./mirna/mirnaFeatCalc.js");
            if(rows[0].emailCount < 5 && rows[0].ipCount < 5){
               mirnaFeatCalc.execute(email, runId, response);
            }else{
               response.contentType('json');
               response.send({"error" : "You can run 5 jobs in a day", "status" : 200});
            }
//            count = rows['COUNT(email)'];
            connection.release();
            var mysqlconn = require('./mysqlqueries.js');
            mysqlconn.logToMirnaLog(runId, email, ip, time);
         });
      });
      //return count;
   },

   getPublications: function(cbf) {
      this.pool.getConnection(function (err, con) {
          con.query('SELECT * FROM Publications', function (err, rows) {
             if (err)
                  throw err;
             else{
                cbf(rows);
               }
             con.release();
          });
      });
   },

   uploadImg : function(data){
      var insert = {imageFile : data.imageFile};
      this.pool.getConnection(function(err, con){
         con.query("UPDATE Publications SET ? WHERE ID = " + data.ID, insert, function(err, rows){
            if(err){
               throw err;
            }else{
               console.log(rows);
            }
            con.release();
         });
      });
   }
};
