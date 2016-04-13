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
//router.get('/posters', function (req, res, next) {
//    getPublications(function (err, publication_rows) {
//        if (err)
//            throw err;
//        for (var i = 0; i < publication_rows.length; i++) {
//
//            getPublicationAuthors({publication_id: publication_rows[i].ID, publications: publication_rows, row_id: i}, function (err, author_rows, data) {
//                if (err)
//                    throw err;
//                data.publications[data.row_id].authors = author_rows;
//                if (data.row_id === data.publications.length - 1) {
//                    res.status(200).render('posters', {title: "jLab Posters", active: "posters", publications: data.publications});
//                }
//            });
//        }
//    });
//});

router.get('/posters', function (req, res, next) {
    getPublications(res);


    //res.end();
});


function getPublications(res) {
    mysqlconn.pool.getConnection(function (err, con) {
        con.query('SELECT * FROM Publications', function (err, rows) {
            if (err)
                throw err;
            else
                getPublicationAuthors(rows, res);
            con.release();
        });
    });
}

function getPublicationAuthors(data, res) {
    for (var i = 0; i < data.length; i++) {
        getAuthors(data[i], data.length, res);
    }
}

function getAuthors(pub, size, res) {
    mysqlconn.pool.getConnection(function (err, con) {
        con.query('SELECT p.fname, p.mnames, p.lname, p.internal FROM Persons p INNER JOIN Authorship a ON p.ID = a.autId WHERE a.pubId = ?', pub.ID, function (err, rows) {
            //console.log(rows);
            con.release();
            pub.aut = rows;
            var publication = pub;
            publications.push(pub);
            if (publications.length === size) {
                publications.sort(predicatBy("year"));
                res.status(200).render('posters', {title: "jLab Posters", active: "posters", publications: publications});
                publications = [];
            }

        });
    });
}

function predicatBy(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return -1;
        } else if (a[prop] < b[prop]) {
            return 1;
        }
        return 0;
    };
}


//
//function getPublications(callback) {
//    mysqlconn.pool.getConnection(function (err, con) {
//        con.query('SELECT * FROM Publications', function (err, rows) {
//            if (err) {
//                callback(err, null);
//            } else {
//                callback(null, rows);
//            }
//            con.release();
//        });
//    });
//}
//
//function getPublicationAuthors(data, callback) {
//    mysqlconn.pool.getConnection(function (err, con) {
//        con.query('SELECT p.fname, p.mnames, p.lname, p.internal FROM Persons p INNER JOIN Authorship a ON p.ID = a.autId WHERE a.pubId = ?', data.publication_id, function (err, rows) {
//            if (err) {
//                callback(err, null);
//            } else {
//                callback(null, rows, data); 
//            }
//            con.release();
//        });
//    });
//}



module.exports = router;
