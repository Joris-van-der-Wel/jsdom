"use strict";
const Benchmark = require("benchmark");
const shallowClone = require("xtend");

function noop() {}

module.exports = function jsdomBenchmark(optionsArg) {
  const options = typeof optionsArg === "function" ?
                  { fn: optionsArg } :
                  shallowClone(optionsArg);

  const setup = options.setup || noop;
  const fn = options.fn;
  const teardown = options.teardown || noop;

  if (options.defer) {
    // `this` refers to a Benchmark.Deferred
    options.setup = "this.benchmark._original.jsdom_setup();";
    options.fn = "this.benchmark._original.jsdom_fn(deferred);";
    options.teardown = "this.benchmark._original.jsdom_teardown();";
  } else {
    // `this` refers to a Benchmark
    options.setup = "this.jsdom_setup();";
    options.fn = "this.jsdom_fn();";
    options.teardown = "this.jsdom_teardown();";
  }

  const benchmark = new Benchmark(options);
  // make sure the properties are not enumerable, otherwise benchmark.js has issues
  Object.defineProperty(benchmark, "jsdom_setup", {value: setup});
  Object.defineProperty(benchmark, "jsdom_fn", {value: fn});
  Object.defineProperty(benchmark, "jsdom_teardown", {value: teardown});
  return benchmark;
};
