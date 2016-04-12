var express = require('express');
var router = express.Router();
var mysqlconn = require('../dev/utils/mysqlqueries.js');

mysqlconn.connect(function(connection){
  if(!connection){
    console.log("Not connected to mysqldb");
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'jLab Bioinformatics'});
});

router.get('/posters', function (req, res, next) {
    res.status(200).render('posters', {title: "jLab Posters", active: "posters"});
});

router.get('/software', function (req, res, next) {
    //mysqlconn.logToDB(req.headers, "software");
    res.status(200).render('software', {title: "jLab Software and Online Tools", active: "software"});
});

router.get('/about', function (req, res, next) {
    res.status(200).render('about', {title: "About jLab", active: "about"});
});

//Bibtex Parse routes
router.post('/bibtexParse/registerBibtex', function(req, res){
  for(var i = 0; i < req.body.length; i++){
    mysqlconn.addPublication(req.body[i]);

  }
  res.end();
});

router.post('/software/mirna/calcMirna', function(req, res){
   //console.log(req.body);
   console.log(req.body);
   var mirna = require('../dev/utils/mirna/mirnaFeatCalc.js') ;
   //console.log(req.body.inputFasta, req.body.inputFeat, req.body.email, req.body.runId);
   //console.log(req.body[inputFasta]);
   //console.log(req.body.inputFasta);
   console.log(req.body);
   mirna.calculate(req.body.inputFasta, req.body.feat, req.body.email, req.body.runId);
   res.end();
});

router.get('/software/mirna/', function(req, res, next){
   res.status(200).render('mirna', {title: "jLab Hairpin Calculator", active: "mirna"});
});


module.exports = router;
