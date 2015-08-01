var exec 	= require('child_process').exec;
var fork 	= require('child_process').fork;
var fs 		= require('fs');
var mime	= require('mime');
var mkdirp	= require('mkdirp');
var path 	= require('path');
var q 		= require('q');
var rimraf	= require('rimraf');

var inputDataDir = path.join(__dirname, '/data/input/');
var analysisDir = path.join(__dirname, '/data/generated/');

module.exports = {
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

	deleteFile: function (file) {
		var deferred = q.defer();
		fs.unlink(path.join(inputDataDir, file), function(err) {
			if (err) {
				deferred.reject("Failed to delete file " + file);
			} else {
				deferred.resolve();
			}
		});
		return deferred.promise;
	},

	deleteAnalysis: function () {
		var deferred = q.defer();
		rimraf(analysisDir, function (err) {
			if (err) {
				deferred.reject("Failed to delete analysis output directory");
			} else {
				deferred.resolve();
			}
		});
		return deferred.promise;
	},

	analyze: function (file) {
		var deferred = q.defer();
		var outfile = 'gender_by_role.csv';
		if (fs.existsSync(path.join(analysisDir, outfile))) {
			deferred.resolve(outfile);
		} else {
			var cmd = 'Rscript ' + path.join(__dirname, '/scripts/getGenderByRole.R') + ' ' + path.join(inputDataDir + file);
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
