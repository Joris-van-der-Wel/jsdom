"use strict";

const setDefaultSuiteNames = require("./set-default-suit-names");

module.exports = {
  jsdom: require("./jsdom"),
  dom: require("./dom")
};

setDefaultSuiteNames("", module.exports);
