var exec 	= require('child_process').exec;
var fs 		= require('fs');
var mkdirp	= require('mkdirp');
var path 	= require('path');
var q 		= require('q');

module.exports = {
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
		var inputDataPath = __dirname + '/data/input/';
		mkdirp(inputDataPath, function(err) {
			var fstream;
			req.pipe(req.busboy);
		    req.busboy.on('file', function (fieldname, file, filename) {
		        fstream = fs.createWriteStream(inputDataPath + filename);
		        file.pipe(fstream);
		        fstream.on('close', function () {
					deferred.resolve();
		        });
		    });
		});
		return deferred.promise;
	}
};
