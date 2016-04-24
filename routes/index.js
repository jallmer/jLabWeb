var express = require('express');
var router = express.Router();
var mysqlconn = require('../dev/utils/mysqlqueries.js');

mysqlconn.connect(function(connection) {
   if (!connection) {
      console.log("Not connected to mysqldb");
   }
});

/* GET home page. */
router.get('/', function(req, res, next) {
   res.render('index', {
      title: 'jLab Bioinformatics'
   });
});

router.get('/staff', function(req, res, next) {
   res.status(200).render('staff', {
      title: "jLab Staff",
      active: "staff"
   });
});

router.get('/posters', function(req, res, next) {
   res.status(200).render('posters', {
      title: "jLab Posters",
      active: "posters"
   });
});

router.get('/software', function(req, res, next) {
   //mysqlconn.logToDB(req.headers, "software");
   res.status(200).render('software', {
      title: "jLab Software and Online Tools",
      active: "software"
   });
});

router.get('/news', function(req, res, next) {
   res.status(200).render('news', {
      title: "News and Noteworthy about jLab",
      active: "news"
   });
});

router.get('/contact', function(req, res, next) {
   res.status(200).render('contact', {
      title: "Reach jLab",
      active: "contact"
   });
});

router.get('/about', function(req, res, next) {
   res.status(200).render('about', {
      title: "About jLab",
      active: "about"
   });
});

//Bibtex Parse routes
router.post('/bibtexParse/registerBibtex', function(req, res) {
   for (var i = 0; i < req.body.length; i++) {
      mysqlconn.addPublication(req.body[i]);

   }
   res.write("the publications has been added to the database");
   res.end();
});

router.post('/bibtexParse/getPubs', function(req, res) {

   mysqlconn.getPublications(function(rows) {
      res.send(rows);
      res.end();
   });

});


var busboy = require('connect-busboy');
var inspect = require('util').inspect;
router.use(busboy());

router.post('/bibtexParse/uploadImg', function(req, res) {
   var fstream;
   req.pipe(req.busboy);
   var fs = require('fs');
   var filePath = "";
   var pubId = "";
   req.busboy.on('file', function(fieldname, file, filename){
      fstream = fs.createWriteStream(__dirname + "/../public/img/pubImg/" + filename);
      file.pipe(fstream);
      fstream.on('close', function(){
         res.redirect('back');
      });
      filePath = "/img/pubImg/" + filename;
   });
   req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated){
      pubId = val;
   });
   req.busboy.on('finish', function(){
      var data = {
         imageFile : filePath,
         ID : pubId
      }
      mysqlconn.uploadImg(data);
   });
});


router.post('/software/mirna/calcMirna', function(req, res) {
   var mirna = require('../dev/utils/mirna/mirnaFeatCalc.js');
   mirna.calculate(req.body.inputFasta, req.body.feat, req.body.email, req.body.runId);
   res.end();
});

router.get('/software/mirna/', function(req, res, next) {
   res.status(200).render('mirna', {
      title: "jLab Hairpin Calculator",
      active: "mirna"
   });
});

router.get('/software/mirna/featureList', function(req, res, next) {
   res.status(200).render('mirna/featureList', {
      title: 'jLab Hairpin Calculator',
      active: 'mirna/featureList'
   });
});

module.exports = router;
