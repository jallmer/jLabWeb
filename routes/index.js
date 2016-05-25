var express = require('express');
var router = express.Router();
var mysqlconn = require('../dev/utils/mysqlqueries.js');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

router.all('/owncloud*', function(req, res, next){
   proxy.web(req, res, {target: 'http://10.2.24.26:80/'}, function(e) {
   });
});

router.all('/phpmyadmin*', function(req, res, next){
   proxy.web(req, res, {target: 'http://10.2.24.19:8080/'}, function(e){
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

router.get('/courses', function(req, res, next) {
   res.status(200).render('courses', {
      title: "Course List",
      active: "courses"
   });
});

router.get('/curcourses', function(req, res, next) {
   res.status(200).render('curcourses', {
      title: "Current Courses",
      active: "curcourses"
   });
});

router.get('/workshops', function(req, res, next) {
   res.status(200).render('ucon', {
      title: "Workshops",
      active: "workshops"
   });
});

router.get('/tutorials', function(req, res, next) {
   res.status(200).render('ucon', {
      title: "Tutorials",
      active: "tutorials"
   });
});

router.get('/conferences', function(req, res, next) {
   res.status(200).render('ucon', {
      title: "Conferences",
      active: "conferences"
   });
});

router.get('/grants', function(req, res, next) {
   res.status(200).render('ucon', {
      title: "Grants",
      active: "grants"
   });
});

router.get('/projects', function(req, res, next) {
   res.status(200).render('ucon', {
      title: "Projects",
      active: "projects"
   });
});

router.get('/group', function(req, res, next) {
   res.status(200).render('ucon', {
      title: "Group",
      active: "group"
   });
});

router.get('/collaborators', function(req, res, next) {
   res.status(200).render('ucon', {
      title: "Collaborators",
      active: "collaborators"
   });
});

router.get('/timeline', function(req, res, next) {
   res.status(200).render('ucon', {
      title: "Timeline",
      active: "timeline"
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
   mirna.calculate(req.body.inputFasta, req.body.feat, req.body.email, req.body.runId, req.connection.remoteAddress, res);
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

router.get('/software/PGMiner/', function(req, res, next) {
   res.status(200).render('PGMiner', {
      title: "jLab PGMiner",
      active: "PGMiner"
   });
});




module.exports = router;
