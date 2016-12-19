/* eslint no-process-env:0 no-console:0 */
"use strict";

const nodePath = require("path");

module.exports = config => {
  const options = {
    basePath: nodePath.resolve(__dirname, ".."),
    frameworks: ["mocha", "browserify"],

    files: [
      {
        pattern: "lib/**",
        watched: true,
        served: false,
        included: false
      },
      {
        // this directory is served so that we can test fetching fixtures
        // make sure that this pattern does not match the entry point test/index.js
        // otherwise we hit node-browserify#1003
        pattern: "test/!(web-platform-tests)/**",
        served: true,
        watched: true,
        included: false
      },
      {
        pattern: "test/index.js",
        watched: false,
        served: true,
        included: true
      }
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
    logLevel: config.LOG_INFO,
    autoWatch: true,

    browsers: ["Firefox"], //  TODO chrome
    singleRun: true
  };

  config.set(options);
};
