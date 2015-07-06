module.exports = {
	load: function () {
		var exec = require('child_process').exec;
		var q = require('q');

		var deferred = q.defer();
		var rscript = exec('Rscript scripts/getGenderByRole.R',
			function(error, stdout, stderr) {
				var outfile = stdout;
				if (error == null) {
					deferred.resolve(outfile);
				} else {
					deferred.reject();
				}
			}
		);
		return deferred.promise;
	}
};
