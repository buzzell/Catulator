const express = require('express');
const router = express.Router();
var pgp = require('pg-promise')({});
var db = pgp('postgres://buzzell:@localhost:5432/catulator');


router.get('/', (req, res, next) => {
	res.render("landing")
});

router.get('/game', (req, res, next) => {
	res.json({game:"game"})
});

router.get('/twocats', (req, res, next) => {
	db.any('select * from cats order by random() limit 2')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
});



router.get('/vote', (req, res, next) => {
	res.json({vote:"vote"})
});

router.get('/rankings', (req, res, next) => {
	db.any('SELECT * FROM cats ORDER BY rating DESC')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;