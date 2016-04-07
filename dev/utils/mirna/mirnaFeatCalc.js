module.exports = {

   inputFasta: null,
   inputFeat: null,
   mirnaJar: "./dev/utils/mirna/mirnaanalyses/mirnaanalyses.jar",

   calculate: function(inputFasta, inputFeat, email, runId){
      var fs = require('fs'),
         path = require('path'),
         mkdirp = require('mkdirp');
         console.log(__dirname);
         mkdirp(__dirname + '/mirnaanalyses/runs/' + runId, function(err){
            if(err){
               console.log(err);
            }
         });
         fs.writeFile(__dirname + '/mirnaanalyses/runs/' + runId + '/' + 'inputFasta.fasta', inputFasta, function(err){
            if(err){
               console.log(err);
            }
         });
         var stringutils = require('../stringutils.js');
         inputFeat = stringutils.replaceAll(inputFeat, 'plus', '+');
         fs.writeFile(__dirname + '/mirnaanalyses/runs/' + runId + '/' + 'inputFeat.txt', inputFeat, function(err){
            if(err){
               console.log(err);
            }
         });

         var exec = require('child_process').exec;
         var folder = './dev/utils/mirna/runs/' + runId + '/';

         exec("./dev/utils/mirna/mirnaanalyses/mirna.sh " + runId, function callback(error, stdout, stderr){
            console.log(stdout);
            console.log(stderr);
            var mirna = require('./mirnaFeatCalc.js');
            mirna.sendMail(email, runId);
         });
   },

   sendMail: function(email, runId){
      var nodemailer = require('nodemailer');

      var transporter = nodemailer.createTransport('smtps://jlabmirna%40gmail.com:j1234lab@smtp.gmail.com');

      var mailOptions = {
         from: '"JLab Hairpin Feature Calculator", <jlabmirna@gmail.com>',
         to: email,
         subject: 'JLab Hairpin Feature Calculator',
         text: 'Hi,\nPlease find the results of your calculation for your run with the ID: ' + runId + ' in the attached file',
         //html: '',
         attachments: [
            {
               path: __dirname + '/mirnaanalyses/runs/' + runId + '/' + runId + '.tab'
            }
         ]
      };

      transporter.sendMail(mailOptions, function(error, info){
         if(error){
            console.log(error);
            console.log(info);
         }
      });
   }
}
