module.exports = {

   inputFasta: null,
   inputFeat: null,
   mirnaJar: "./dev/utils/mirna/mirnaanalyses/mirnaanalyses.jar",

   calculate: function(inputFasta, inputFeat, email, runId) {
      var fs = require('fs'),
         path = require('path'),
         mkdirp = require('mkdirp');
      mkdirp(__dirname + '/mirnaanalyses/runs/' + runId, function(err) {
         if (err) {
            console.log(err);
         }
      });
      fs.writeFile(__dirname + '/mirnaanalyses/runs/' + runId + '/' + 'inputFasta.fasta', inputFasta, function(err) {
         if (err) {
            console.log(err);
         }
      });
      var stringutils = require('../stringutils.js');
      inputFeat = stringutils.replaceAll(inputFeat, 'plus', '+');
      inputFeat = "Accession\nHairpinSequence\nRNAFolds\n" + stringutils.replaceAll(inputFeat, ',', '\n');
      fs.writeFile(__dirname + '/mirnaanalyses/runs/' + runId + '/' + 'inputFeat.txt', inputFeat, function(err) {
         if (err) {
            console.log(err);
         }
      });
      this.canRun(email, runId);
   },

   sendMail: function(email, runId) {
      var nodemailer = require('nodemailer');
      var pass = 'xxx';
      var transporter = nodemailer.createTransport('smtps://jlabmirna%40gmail.com:' + pass + '@smtp.gmail.com');

      var mailOptions = {
         from: '"JLab Hairpin Feature Calculator", <jlabmirna@gmail.com>',
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
         }
      });
   },

   canRun: function(email, runId) {
      var mysqlconn = require('../mysqlqueries.js');
      var d = new Date();
      var date = d.getDate();
      var month = d.getMonth() + 1;
      var year = d.getFullYear();
      var day = date + "-" + month + "-" + year;
      var ip = '10.2.30.139';
      mysqlconn.connect(function(connection) {
         if (!connection) {
            console.log("Not connected to mysqldb");
         }
      });
      mysqlconn.getMirnaRunTimes(email, ip, day, runId);
      //console.log("count " + count);


   },

   execute: function(email, runId) {
      var exec = require('child_process').exec;
      var folder = './dev/utils/mirna/runs/' + runId + '/';
      var process = exec("./dev/utils/mirna/mirnaanalyses/mirna.sh " + runId, function callback(error, stdout, stderr) {
         if(error)
            console.log(error);
         console.log(stdout);
         console.log(stderr);
         var mirna = require('./mirnaFeatCalc.js');
         mirna.sendMail(email, runId);
      });
      process.on('exit', function(code){
         console.log(code);
      });
   }
}
