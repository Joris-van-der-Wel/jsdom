"use strict";
const Benchmark = require("benchmark");
const jsdom = require("../..");

exports["env() defaults"] = new Benchmark.Suite({async: true}).add({
  defer: true,
  fn: function (deferred) {
    jsdom.env({
      html: "",
      done: deferred.resolve.bind(deferred)
    });
  }
});

exports["jsdom() defaults"] = new Benchmark.Suite().add({
  fn: function () {
    jsdom.jsdom();
  }
});

exports["jsdom() no resources"] = new Benchmark.Suite().add({
  fn: function () {
    jsdom.jsdom("", {
      features: {
        FetchExternalResources: false,
        ProcessExternalResources: false
      }
    });
  }
});
