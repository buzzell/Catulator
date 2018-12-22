const express = require('express'),
      router = express.Router(),
      pgp = require('pg-promise')({}),
      EloRating = require('elo-rating'),
      db = pgp(process.env.DB_CONNECTION_URL),
      md5 = require('md5'),
      multer  = require('multer'),
      fs = require('fs'),
      shortid = require('shortid');

const upload = multer({ storage: multer.diskStorage({
    destination: "uploads/",
    filename: function (req, file, cb) {
        let ext;
        if(file.mimetype == "image/jpeg"){
            ext = "jpg"
        }else if(file.mimetype == "image/png"){
            ext = "png"
        }else if(file.mimetype == "image/gif"){
            ext = "gif"
        }
        cb(null, md5(Date.now()+file.originalname)+"."+ext)
    }
})})

// GET
// render the landing page
router.get('/', (req, res, next) => {
	res.render("landing");
});

// GET
// render the game
router.get('/game', (req, res, next) => {
	res.render("game")
});

// GET
// render page for rankings
router.get('/rankings', (req, res, next) => {
    if(!req.query.order) req.query.order = 2;
    if(!req.query.dirr) req.query.dirr = "DESC";
    db.any('SELECT * FROM cats ORDER BY $1 $2:raw', [parseInt(req.query.order), req.query.dirr])
    .then(function (data) {
        res.render("rankings", {data:data})
    }).catch(function (err) {
        return next(err);
    });
});

// GET
// return json data for rankings
router.get('/rankings.json', (req, res, next) => {
    if(!req.query.order) req.query.order = 6;
    if(!req.query.dirr) req.query.dirr = "DESC";
    db.any('SELECT * FROM cats ORDER BY $1 $2:raw', [parseInt(req.query.order), req.query.dirr])
    .then(function (data) {
        res.json(data)
    }).catch(function (err) {
        return next(err);
    });
});

// GET
// Page for uploading new photo
router.get('/add', (req, res, next) => {
    res.render('add')
})

// POST
// Upload route for adding new photo
router.post('/upload', upload.single('file'), (req, res, next) => {
    let i = shortid.generate()
    let f = req.file.filename
    db.any('INSERT INTO cats (id, filename, url) VALUES($1, $2, $3) RETURNING *', [i, f, "http://devbox:3000/cats/"+i+".jpg"])
    .then(function (data) {
        res.json(data)
    }).catch(function (err) {
        return next(err);
    });
});

// GET
// return cat image from id
router.get('/cats/:id.jpg', (req, res, next) => {
    let id = req.params.id
    db.any('select * from cats where id = $1', id)
    .then(function (data) {
        if(data.length){
            res.writeHead(200, {'Content-Type': 'image/jpeg' });
            res.end(fs.readFileSync('./uploads/'+data[0].filename), 'binary');
        }else{
            const err = new Error("That kitty can't be found")
            err.status = 404
            next(err)
        }
    })
})

// GET
// page for viewing single cat ranking
router.get('/cats/:id', (req, res, next) => {
    let id = req.params.id
    db.any('select * from cats where id = $1', id)
    .then(function (data) {
        if(data.length){
            res.render('cat', {cat:data[0]})
        }else{
            const err = new Error("That kitty can't be found")
            err.status = 404
            next(err)
        }
    })
})

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
        let result = EloRating.calculate(parseInt(data[1].rank), parseInt(data[0].rank), true, 16);
        db.task(async (t) => {
    		await t.none(
    			'update cats set rank = $1, won = won + 1 where id = $2', 
    			[
    				parseInt(result.playerRating),
    				winnerId
    			]
    		);
    		await t.none(
    			'update cats set rank = $1, lost = lost + 1 where id = $2', 
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
					rank: result.playerRating
				},
				{
					id: loserId,
					won: data[0].won,
					lost: data[0].lost + 1,
					rank: result.opponentRating
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