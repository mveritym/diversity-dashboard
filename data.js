module.exports = {
	load: function () {
		var exec = require('child_process').exec;
		var q = require('q');

		var deferred = q.defer();
		var rscript = exec('Rscript scripts/getGenderByRole.R',
			function(error, stdout, stderr) {
				if (error == null) {
					deferred.resolve();
				} else {
					deferred.reject();
				}
			}
		);
		return deferred.promise;
	}
};
