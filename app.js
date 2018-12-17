const express = require('express'),
	  jsonParser = require('body-parser').json,
	  favicon = require('express-favicon');
	  app = express();

app.use(jsonParser());
app.use(express.static('public'))
app.use(favicon('/public/favicon.ico'));
app.set('view engine', 'pug');

const routes = require('./routes')
app.use(routes);

app.use((req, res, next) => {
	const err = new Error('Not Found')
	err.status = 404
	next(err)
})

app.use((err, req, res, next) => {
	res.locals.error = err;
	res.status(err.status >= 100 && err.status < 600 ? err.status : 500);
	res.render("error");
})

app.listen(3000, () => {
	console.log('Listening on 3000')
})