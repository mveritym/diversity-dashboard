var app     = require('../app');
var Browser  = require('zombie');

describe('home page', function() {
    before(function(done) {
        this.browser = new Browser({ site: "http://localhost:3000"});
        this.browser.visit('/', done);
    });

    it('should have a title', function() {
        this.browser.assert.success();
        this.browser.assert.text('h3', 'Diversity Dashboard');
    });

    it('should have hidden submit buttons', function() {
        this.browser.assert.element('#submit-buttons');
        this.browser.assert.elements('#submit-buttons > button', 2);
        this.browser.assert.style('#submit-buttons', 'display', 'none');
    });

    it('should have a hidden spinner', function() {
        this.browser.assert.element('.spinner');
        this.browser.assert.elements('.spinner > div', 5);
        this.browser.assert.style('.spinner', 'display', 'none');
    });

    it('should have a dropzone', function() {
        this.browser.assert.element('#dropzone-container');
        this.browser.assert.style('#dropzone-container', 'display', '');
        this.browser.assert.element('#dropzone-error');
        this.browser.assert.text('#dropzone-error > span', '');
        this.browser.assert.element('#dropzone-container > .dropzone');
    });

    it('should have a hidden chart', function() {
        this.browser.assert.element('#chart-container');
        this.browser.assert.style('#chart-container', 'display', 'none');
    });
});
