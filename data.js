var exec 	= require('child_process').exec;
var fork 	= require('child_process').fork;
var fs 		= require('fs');
var mime	= require('mime');
var mkdirp	= require('mkdirp');
var path 	= require('path');
var q 		= require('q');

var inputDataDir = __dirname + '/data/input/';

module.exports = {
	getExistingFiles: function () {
		var deferred = q.defer();
		fs.readdir(inputDataDir, function (err, files) {
			files.forEach(function(file) {
				if (mime.lookup(file) == 'text/csv') {
					var size = fs.statSync(inputDataDir + file).size;
					deferred.resolve({ name: file, size: size });
				}
			});
			deferred.reject();
		});
		return deferred.promise;
	},

	validate: function (file) {
		var deferred = q.defer();
		var cmd = 'Rscript scripts/validateInputFile.R data/input/' + file;
		exec(cmd, function(error, stdout, stderr) {
			if (stderr == '') {
				deferred.resolve(true);
			} else {
				deferred.resolve(false);
			}
		});
		return deferred.promise;
	},

	analyze: function (file) {
		var deferred = q.defer();
		var outfile = 'data/generated/gender_by_role.csv';
		if (fs.existsSync(path.join(__dirname + '/' + outfile))) {
			deferred.resolve(outfile);
		} else {
			var cmd = 'Rscript scripts/getGenderByRole.R data/input/' + file;
			exec(cmd, function(error, stdout, stderr) {
				var outfile = stdout;
				if (error == null) {
					deferred.resolve(outfile);
				} else {
					deferred.reject();
				}
			});
		}
		return deferred.promise;
	},

	upload: function (req) {
		var deferred = q.defer();
		mkdirp(inputDataDir, function(err) {
			var fstream;
			req.pipe(req.busboy);
		    req.busboy.on('file', function (fieldname, file, filename) {
		        fstream = fs.createWriteStream(inputDataDir + filename);
		        file.pipe(fstream);
		        fstream.on('close', function () {
					deferred.resolve();
		        });
		    });
		});
		return deferred.promise;
	}
};
