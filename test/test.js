process.env.NODE_ENV = 'test';

var app     = require('../app');
var assert  = require('assert');
var Browser = require('zombie');
var http    = require('http');

describe('home page', function() {
    before(function() {
        this.server = http.createServer(app).listen(3000);
        this.browser = new Browser({ site: 'http://localhost:3000' });
    });

    before(function(done) {
        this.browser.visit('/', done);
    });

    it('should have a title', function() {
        assert.equal(this.browser.text('h3'), 'Diversity Dashboard');
    });

    after(function(done) {
        this.server.close(done);
    });
});
