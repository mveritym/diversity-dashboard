var express = require('express');
var app = express();
var path = require('path');
var q = require('q');
var data = require('./data');

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/loadData', function(req, res) {
	data.load()
	.then(function(outfile) {
		res.status(200).send(outfile);
	}, function() {
		res.sendStatus(500);
	})
	.done();
});

app.get('/loadFile', function(req, res) {
	var file = req.query.fileName;
	res.sendFile(path.join(__dirname + '/' + file));
});

app.use(express.static('static', { etag: false }));

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});
