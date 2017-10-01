var express = require('express');
var tmp = require('tmp');
var zipFolder = require('zip-folder');
var path = require('path');
var yeoman = require('yeoman-environment');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/', function (req, res) {
  // TODO: Decent error handling.
  var env = yeoman.createEnv([]);
  env.register(require.resolve('generator-castlecss'), 'castlecss:app');

  var target;

  // Create a random name for the zip file.
  tmp.tmpName({ template: __dirname + '/../public/downloads/castlecss-XXXXXX.zip' }, function (err, path) {
    if (err) throw err;
    target = path;
  });

  tmp.dir(function (tempDirErr, path, cleanupCallback) {
    if (tempDirErr) throw tempDirErr;

    // TODO: Parse actual input from form.
    var options = {
      'projectname': 'dummy',
      'features': 'castlecss-notifications',
      'buildsystem': 'gulp',
      'destinationpath': path
    }

    // Run the generator.
    env.run('castlecss:app', options, function (generateErr) {
      if (generateErr) throw generateErr;

      // Zip the result.
      zipFolder(path, target, function (zipErr) {
        if (zipErr) throw zipErr;

        // Send the zip to be downloaded.
        res.download(target);
      });
    });
  });
});

module.exports = router;
