module.exports = {

   inputFasta: null,
   inputFeat: null,
   mirnaJar: "./dev/utils/mirna/mirnaanalyses/mirnaanalyses.jar",

   calculate: function(inputFasta, inputFeat, email, runId, remoteAddress, response) {
      var fs = require('fs'),
         path = require('path'),
         mkdirp = require('mkdirp');
      mkdirp.sync(__dirname + '/mirnaanalyses/runs/' + runId);
      fs.writeFileSync(__dirname + '/mirnaanalyses/runs/' + runId + '/' + 'inputFasta.fasta', inputFasta);
      var stringutils = require('../stringutils.js');
      inputFeat = stringutils.replaceAll(inputFeat, 'plus', '+');
      inputFeat = "Accession\nHairpinSequence\nRNAFolds\n" + stringutils.replaceAll(inputFeat, ',', '\n');
      fs.writeFileSync(__dirname + '/mirnaanalyses/runs/' + runId + '/' + 'inputFeat.txt', inputFeat);
      this.canRun(email, runId, remoteAddress, response);
   },

   sendMail: function(email, runId, response) {
      var nodemailer = require('nodemailer');

      // var transporter = nodemailer.createTransport('smtps://jlabmirna%40gmail.com:' + pass + '@smtp.gmail.com');

      var pass = 'j1972lab';
      var transporter = nodemailer.createTransport('smtps://bioinfo%40allmer.de:' + pass + '@smtp.strato.de');

      var mailOptions = {
         from: '"JLab Hairpin Feature Calculator", <bioinfo@allmer.de>',
         to: email,
         subject: 'JLab Hairpin Feature Calculator',
         text: 'Hi,\nPlease find the results of your calculation for your run with the ID: ' + runId + ' in the attached file',
         //html: '',
         attachments: [{
            path: __dirname + '/mirnaanalyses/runs/' + runId + '/' + runId + '.tab'
         }]
      };

      transporter.sendMail(mailOptions, function(error, info) {
         if (error) {
            console.log(error);
            console.log(info);
            response.contentType('json');
            response.send({"error" : "Server Error", "status" : 200});
         }
      });
   },

   canRun: function(email, runId, remoteAddress, response) {
      var mysqlconn = require('../mysqlqueries.js');
      var d = new Date();
      var date = d.getDate();
      var month = d.getMonth() + 1;
      var year = d.getFullYear();
      var day = date + "-" + month + "-" + year;
      var ip = remoteAddress;
      mysqlconn.connect(function(connection) {
         if (!connection) {
            console.log("Not connected to mysqldb");
            response.contentType('json');
            response.send({"error" : "Server Error", "status" : 200});
         }
      });
      mysqlconn.getMirnaRunTimes(email, ip, day, runId, response);
      //console.log("count " + count);


   },

   execute: function(email, runId, response) {
      var exec = require('child_process').exec;
      var folder = './dev/utils/mirna/runs/' + runId + '/';
      var process = exec("./dev/utils/mirna/mirnaanalyses/mirna.sh " + runId, function callback(error, stdout, stderr) {
         if(error)
            console.log(error);
         console.log(stdout);
         console.log(stderr);
         var mirna = require('./mirnaFeatCalc.js');
         mirna.sendMail(email, runId, response);
      });
      process.on('exit', function(code){
         response.contentType('json');
         response.send({"success" : "Your request has been completed", "status" : 200});
      });
   }
}
