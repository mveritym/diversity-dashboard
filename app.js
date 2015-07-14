var busboy 	= require('connect-busboy');
var data 	= require('./data');
var http	= require('http');
var express = require('express');
var path 	= require('path');

var app = express();

app.use(busboy());
app.use(express.static('static', { etag: false }));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/get-existing-files', function (req, res) {
	data.getExistingFiles()
	.then(function(result) {
		res.status(200).send(result);
	}, function() {
		res.status(200).send(null);
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

app.get('/delete-file', function (req, res) {
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
	res.sendFile(path.join(__dirname + '/' + file));
});

app.get('/analyze-data', function(req, res) {
	data.analyze(req.query.fileName)
	.then(function(outfile) {
		res.status(200).send(outfile);
	}, function() {
		res.sendStatus(500);
	}).done();
});

app.post('/upload-file', function(req, res) {
	data.upload(req)
	.then(function() {
		res.sendStatus(200);
	}, function() {
		res.sendStatus(500);
	}).done();
});

module.exports = app;

app.set('port', process.env.PORT || 3000);
if (!module.parent) {
	http.createServer(app).listen(app.get('port'), function(){
		console.log("Diversity Dashboard listening on port " + app.get('port'));
	});
}
