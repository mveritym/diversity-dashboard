var exec 	= require('child_process').exec;
var fs 		= require('fs');
var mkdirp	= require('mkdirp');
var path 	= require('path');
var q 		= require('q');
var rimraf	= require('rimraf');
var tmp 	= require('tmp');

var inputDataDir = path.join(__dirname, '/data/input/');
var analysisDir = path.join(__dirname, '/data/generated/');

module.exports = {
	upload: function (req) {
		var deferred = q.defer();

		var uploaded_file_name;
		tmp.tmpName({ postfix: '.csv', dir: inputDataDir }, function _tempNameGenerated(err, path) {
		    if (err) deferred.reject();
			uploaded_file_name = path;
		});

		mkdirp(inputDataDir, function(err) {
			var fstream;
			req.pipe(req.busboy);
		    req.busboy.on('file', function (fieldname, file, filename) {
		        fstream = fs.createWriteStream(uploaded_file_name);
		        file.pipe(fstream);
		        fstream.on('close', function () {
					fstream.end();
					deferred.resolve(uploaded_file_name);
		        });
		    });
		});

		return deferred.promise;
	},

	validate: function (file) {
		var deferred = q.defer();
		var cmd = 'Rscript scripts/validateInputFile.R ' + file;
		exec(cmd, function(error, stdout, stderr) {
			if (stderr == '') {
				deferred.resolve(true);
			} else {
				deferred.resolve(false);
			}
		});
		return deferred.promise;
	},

	deleteInputFile: function (file) {
		var deferred = q.defer();
		fs.unlink(file, function(err) {
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

	analyze: function (infile) {
		var deferred = q.defer();
		var scriptPath = path.join(__dirname, '/scripts/getGenderByRole.R');

		tmp.tmpName({ postfix: '.csv', dir: analysisDir }, function _tempNameGenerated(err, path) {
		    if (err) deferred.reject();
			var outfile = path;

			mkdirp(analysisDir, function(err) {
				if (err) deferred.reject();

				var cmd = ['Rscript ', scriptPath, infile, outfile].join(' ');
				exec(cmd, function(error, stdout, stderr) {
					if (error) {
						console.log("R ERROR: " + error);
						deferred.reject();
					}
					deferred.resolve(outfile);
				});
			});
		});

		return deferred.promise;
	}
};
