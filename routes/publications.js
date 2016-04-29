/* global publications */

var express = require('express');
var router = express.Router();
var mysqlconn = require('../dev/utils/mysqlqueries.js');

mysqlconn.connect(function (connection) {
    if (!connection) {
        console.log("Not connected to mysqldb");
    }
});

publications = [];

router.get('/articles', function (req, res, next) {
    getPublications(res, 'article');
});

router.get('/books', function (req, res, next) {
    getPublications(res, 'book');
});

router.get('/posters', function (req, res, next) {
    getPublications(res, 'poster');
});


function getPublications(res, type) {
    mysqlconn.pool.getConnection(function (err, con) {
        con.query('SELECT * FROM Publications WHERE type = ?', type, function (err, rows) {
            if (err)
                throw err;
            else
                con.release();
            for (var i = 0; i < rows.length; i++) {
                getAuthors(rows[i], rows.length ,function() {
                      res.status(200).render('posters', {title: "jLab Posters", active: type, publications: publications});
                       publications = [];
                });
            }
        });
    });
}

function getAuthors(publication, size , callback) {
    mysqlconn.pool.getConnection(function (err, con) {
        con.query('SELECT p.fname, p.mnames, p.lname, p.internal FROM Persons p INNER JOIN Authorship a ON p.ID = a.autId WHERE a.pubId = ?', publication.ID, function (err, rows) {
            if (err)
                throw err;
            else {
                con.release();
                publication.authors = rows;
                publications.push(publication);   
                if (publications.length === size) {
                  callback();  
                };
            }
        });
    });
}
module.exports = router;
