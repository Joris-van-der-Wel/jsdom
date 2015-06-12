"use strict";

const setDefaultSuiteNames = require("./set-default-suit-names");

module.exports = {
  dom: require("./dom")
};

setDefaultSuiteNames("", module.exports);
