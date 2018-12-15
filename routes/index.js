const express = require('express');
const router = express.Router();
const pgp = require('pg-promise')({});
const EloRating = require('elo-rating');
const db = pgp('postgres://buzzell:@localhost:5432/catulator');

// GET
// render the landing page
router.get('/', (req, res, next) => {
	res.render("landing");
});

// GET
// render the game
router.get('/game', (req, res, next) => {
	res.render("game", {page: "game"})
});

// GET
// render page for rankings
router.get('/rankings', (req, res, next) => {
    if(!req.query.order) req.query.order = 5;
    if(!req.query.dirr) req.query.dirr = "DESC";
    db.any('SELECT * FROM cats ORDER BY $1 $2:raw', [parseInt(req.query.order), req.query.dirr])
    .then(function (data) {
        res.render("rankings", {data:data, page: "rankings"})
    }).catch(function (err) {
        return next(err);
    });
});

// GET
// get json for two random cats
router.get('/twocats.json', (req, res, next) => {
	db.any('select * from cats order by random() limit 2')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
});

// POST
// submit a vote
router.post('/vote', (req, res, next) => {
	let winnerId = req.body.winner;
	let loserId = req.body.loser;
	db.task(async (t) => {
    	let winnerData = await t.one('select * from cats where id = $1', winnerId);
    	let loserData = await t.one('select * from cats where id = $1', loserId);
    	return [loserData, winnerData];
	})
   .then(data => {
        let result = EloRating.calculate(parseInt(data[1].rating), parseInt(data[0].rating), true, 16);
        db.task(async (t) => {
    		await t.none(
    			'update cats set rating = $1, won = won + 1 where id = $2', 
    			[
    				parseInt(result.playerRating),
    				winnerId
    			]
    		);
    		await t.none(
    			'update cats set rating = $1, lost = lost + 1 where id = $2', 
    			[
    				parseInt(result.opponentRating),
    				loserId
    			]
    		);
		}).then(() => {
			res.status(200).json([
				{
					id: winnerId,
					won: data[1].won + 1,
					lost: data[1].lost,
					rating: result.playerRating
				},
				{
					id: loserId,
					won: data[0].won,
					lost: data[0].lost + 1,
					rating: result.opponentRating
				}
			]);
		}).catch(err => {
    		return next(err);
    	});
	}).catch(err => {
    	return next(err);
    });
});

module.exports = router;