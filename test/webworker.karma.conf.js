"use strict";

const nodePath = require('path');

module.exports = config => {
  config.set({
    basePath: nodePath.resolve(__dirname, ".."),
    frameworks: ["mocha-webworker", "browserify"],

    files: [
      {pattern: "lib/*"        , watched: true , served: false, included: false},
      {pattern: "test/*"       , watched: true , served: false, included: false},
      {pattern: "test/index.js", watched: true , served: true , included: false}
    ],
    preprocessors: {
      "test/index.js": ["browserify"]
    },

    browserify: {
      debug: true
    },

    reporters: ["progress"],
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    autoWatch: true,

    browsers: ['Chrome'],
    singleRun: true
  });
};
