var express = require('express');
var busboy 	= require('connect-busboy');
var fs 		= require('fs');
var path 	= require('path');
var mkdirp	= require('mkdirp');
var data 	= require('./data');

var app = express();

app.use(busboy());
app.use(express.static('static', { etag: false }));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/load-file', function(req, res) {
	var file = req.query.fileName;
	res.sendFile(path.join(__dirname + '/' + file));
});

app.get('/analyze-data', function(req, res) {
	data.load(req.query.fileName)
	.then(function(outfile) {
		res.status(200).send(outfile);
	}, function() {
		res.sendStatus(500);
	})
	.done();
});

app.post('/upload-file', function(req, res) {
	var inputDataPath = __dirname + '/data/input/';
	mkdirp(inputDataPath, function(err) {
		var fstream;
		req.pipe(req.busboy);
	    req.busboy.on('file', function (fieldname, file, filename) {
	        fstream = fs.createWriteStream(inputDataPath + filename);
	        file.pipe(fstream);
	        fstream.on('close', function () {
	            res.redirect('back');
	        });
	    });
	});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});
