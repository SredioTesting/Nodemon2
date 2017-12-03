'use strict';
/*global describe:true, it: true, after: true */
var nodemon = require('../../lib/');
var utils = require('../utils');
var path = require('path');
var appjs = path.resolve(__dirname, '..', 'fixtures', 'watch-count', 'index.js');
var assert = require('assert');
var watchRe = /watching ([\d,]+) files/;

describe('watch count', function () {
  var pwd = process.cwd();

  afterEach(function () {
    // reset the cwd
    process.chdir(pwd);
  });

  after(function (done) {
    // clean up just in case.
    nodemon.once('exit', function () {
      nodemon.reset(done);
    }).emit('quit');
  });

  it('should respect ignore rules', function (done) {
    var errMsg = null;
    var that = this;
    process.chdir('test/fixtures/watch-count');
    nodemon({ script: appjs, verbose: true }).on('start', function () {
      setTimeout(function () {
        nodemon.emit('quit');
      }, 200);
    }).on('log', function (data) {
      var match = null;
      var count = 0;
      var match = data.message.match(watchRe);
      if (match && match[1]) {
        var count = match[1].replace(',', '') * 1;
        try {
          assert.equal(count, 6, 'Watching ' + count + ' files, expecting 6.');
        } catch (e) {
          nodemon.emit('error', 'Watching ' + count + ' files, expecting 6.')
        }
      }
    })
    .on('error', function(err) {
      errMsg = new Error(err);
    })
    .on('exit', function() {
      nodemon.reset(done.bind(that, errMsg))
    });
  });

  it('should fail respect ignore rules', function (done) {
    var errMsg = null;
    var that = this;
    process.chdir('test/fixtures/watch-count');
    nodemon({ script: appjs, verbose: true }).on('start', function () {
      setTimeout(function () {
        errMsg = new Error('Error not raised')
        nodemon.emit('quit');
      }, 200);
    }).on('log', function (data) {
      var match = null;
      var count = 0;
      if (match = data.message.match(watchRe)) {
        count = match[1].replace(',', '') * 1;
        try {
          assert(count === 5, 'Watching ' + count + ' files, expecting 5.');
        } catch (e) {
          return nodemon.emit('quit')
        }
      }
    })
    .on('error', function(err) {
      errMsg = new Error(err);
    })
    .on('exit', function() {
      nodemon.reset(done.bind(that, errMsg))
    });
  });

  it('should watch special characters directory names', function (done) {
    var errMsg = null;
    var that = this;
    process.chdir(path.resolve(__dirname, '..', 'fixtures', 'somedir!'));
    var appjs = path.resolve(__dirname, '..', 'fixtures', 'somedir!', 'index.js');
    nodemon({ script: appjs, verbose: true }).on('start', function () {
      setTimeout(function () {
        nodemon.emit('quit');
      }, 200);
    }).on('log', function (data) {
      var match = data.message.match(watchRe);
      if (match && match[1]) {
        var count = match[1].replace(',', '') * 1;
        try {
          assert.equal(count, 1, 'Watching ' + count + ' files, expecting 1.');
        } catch (e) {
          return nodemon.emit('error', 'Watching ' + count + ' files, expecting 1.')
        }
      }
    })
    .on('error', function(err) {
      errMsg = new Error(err);
    })
    .on('exit', function() {
      nodemon.reset(done.bind(that, errMsg))
    });
  });
});
