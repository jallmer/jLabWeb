var express = require('express');
var router = express.Router();
var mysqlconn = require('../dev/utils/mysqlqueries.js');

mysqlconn.connect(function (connection) {
    if (!connection) {
        console.log("Not connected to mysqldb");
    }
});

router.get('/', function (req, res, next) {
    getPersons(res);
});

Array.prototype.shuffle = function () {
    var input = this;

    for (var i = input.length - 1; i >= 0; i--) {

        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];

        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
};



function getPersons(res) {
    mysqlconn.pool.getConnection(function (err, con) {
        con.query('SELECT p.fname, p.mnames, p.lname, p.internal, p.image, a.level FROM Persons p INNER JOIN Association a ON p.ID = a.personID ORDER BY p.ID ASC', function (err, rows) {
            if (err)
                throw err;
            else {
                var head = [];
                var phds = [];
                var masters = [];
                var bachelors = [];

                for (var i = 0; i < rows.length; i++) {
                    switch (rows[i].level) {
                        case "HEAD":
                            head.push(rows[i]);
                            break;
                        case "PhD Student":
                            phds.push(rows[i]);
                            break;
                        case "Master Student":
                            masters.push(rows[i]);
                            break;
                        case "Bachelors Student":
                            bachelors.push(rows[i]);
                            break;
                    }
                }

                phds.shuffle();
                masters.shuffle();
                bachelors.shuffle();

                res.status(200).render('staff', {title: "jLab Staff", active: "Staff", head: head, phds: phds, masters: masters, bachelors: bachelors});
            }
        });
    });
}

module.exports = router;