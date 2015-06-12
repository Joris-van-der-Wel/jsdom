"use strict";

module.exports = function setDefaultSuiteNames(path, obj) {
  if (typeof obj.run === "function") {
    // a single suite
    if (!obj.name) {
      obj.name = path;
    }
    return;
  }

  Object.keys(obj).forEach(function (name) {
    module.exports((path ? path + "/" : "") + name, obj[name]);
  });
};
