var express = require('express');
var router = express.Router();
var mysqlconn = require('../dev/utils/mysqlqueries.js');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

router.all('/owncloud*', function(req, res, next){
   console.log('redirecting ' + req.url);
   // req.url = '/owncloud/index.php';
   proxy.web(req, res, {target: 'http://10.2.24.26:80/'}, function(e) {
      console.log(e);
   });
});

router.all('/phpmyadmin*', function(req, res, next){
   console.log('redirecting ' + req.url);
   proxy.web(req, res, {target: 'http://10.2.24.19:8080/'}, function(e){
      console.log(e);
   });
});

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

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
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
