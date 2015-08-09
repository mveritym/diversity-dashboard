var busboy 	= require('connect-busboy');
var data 	= require('./data');
var express = require('express');
var http	= require('http');
var path 	= require('path');

var app = express();

app.use(busboy());
app.use(express.static(__dirname + '/static'));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.post('/upload-file', function(req, res) {
	data.upload(req)
	.then(function(file_name) {
		res.status(200).send(file_name);
	}, function() {
		res.sendStatus(500);
	}).done();
});

app.get('/validate-file', function (req, res) {
	var file = req.query.fileName;
	data.validate(file)
	.then(function(isValid) {
		res.status(200).send(isValid);
	}, function() {
		res.status(500);
	}).done();
});

app.get('/analyze-data', function(req, res) {
	data.analyze(req.query.fileName)
	.then(function(outfile) {
		res.status(200).sendFile(outfile, function() {
			data.deleteFile(req.query.fileName);
			data.deleteFile(outfile).done();
		});
	}, function() {
		res.sendStatus(500);
	}).done();
});

app.get('/delete-input-file', function (req, res) {
	var file = req.query.fileName;
	data.deleteFile(file)
	.then(function() {
		res.sendStatus(200);
	}, function(err) {
		res.status(500).send(err);
	}).done();
});

app.get('/delete-analysis', function (req, res) {
	data.deleteAnalysis()
	.then(function() {
		res.sendStatus(200);
	}, function(err) {
		res.status(500).send(err);
	}).done();
});

app.get('/load-file', function(req, res) {
	var file = req.query.fileName;
	res.sendFile(file);
});

module.exports = app;

app.set('port', process.env.PORT || 3000);
if (!module.parent) {
	http.createServer(app).listen(app.get('port'), function(){
		console.log("Diversity Dashboard listening on port " + app.get('port'));
	});
}
