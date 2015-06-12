"use strict";

module.exports = function getSuites(obj) {
  if (typeof obj.run === "function") {
    // a single suite
    return [obj];
  }

  let ret = [];
  Object.keys(obj).forEach(function (name) {
    ret = ret.concat(module.exports(obj[name]));
  });

  return ret;
};
