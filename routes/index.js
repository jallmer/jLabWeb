var express = require('express');
var router = express.Router();
var mysqlconn = require('../dev/utils/mysqlqueries.js');

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


module.exports = router;
