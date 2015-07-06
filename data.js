module.exports = {
	load: function () {
		var fs = require('fs');
		var path = require('path');
		var exec = require('child_process').exec;
		var q = require('q');
		var deferred = q.defer();

		var outfile = 'data/generated/gender_by_role.csv';
		if (fs.existsSync(path.join(__dirname + '/' + outfile))) {
			deferred.resolve(outfile);
		} else {
			exec('Rscript scripts/getGenderByRole.R',
				function(error, stdout, stderr) {
					var outfile = stdout;
					if (error == null) {
						deferred.resolve(outfile);
					} else {
						deferred.reject();
					}
				}
			);
		}

		return deferred.promise;
	}
};
