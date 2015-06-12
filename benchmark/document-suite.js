"use strict";
const Benchmark = require("benchmark");
const extend = require("xtend");

// jsdom might be an empty document if omitted by browserify
const jsdom = require("..");

const nativeDoc = global.document;
const jsdomDoc = jsdom.jsdom && jsdom.jsdom();

function addBenchmark(suite, benchmark) {
  const event = new Benchmark.Event({type: "add", target: benchmark});
  suite.emit(event);
  if (!event.cancelled) {
    suite.push(benchmark);
  }
}

/**
 * Create a Benchmark.js Suite which runs your benchmark in
 * different document implementations.
 * @param {Object|function} optionsArg Options to pass to `Benchmark`. A function
 *                          can also be given if you do not want to set any options.
 * @param {Benchmark.Suite} [optionsArg.suite=new Benchmark.Suite()] The suite to add the benchmarks to
 * @param {function|string}   optionsArg.fn                           Benchmark test function
 * @param {function|string}  [optionsArg.setup]                       Compiled/called before the test loop
 * @param {function|string}  [optionsArg.teardown]                    Compiled/called after the test loop
 * @param {boolean}          [optionsArg.defer=false]                 A flag to indicate the benchmark is deferred
 * @returns {Benchmark.Suite}
 */
module.exports = function documentSuite(optionsArg) {

  const options = typeof optionsArg === "function" ?
                  { fn: optionsArg } :
                  extend(optionsArg);

  const suite = options.suite || new Benchmark.Suite();
  delete options.suite; // do not pass to `Benchmark`

  let benchmark = new Benchmark(options);
  const name = benchmark.name;

  if (nativeDoc) {
    benchmark.name = name ? name + " :: native" : "native";

    // make sure the property is not enumerable
    Object.defineProperty(benchmark, "document", {value: nativeDoc});
    Object.defineProperty(benchmark, "documentImplementation", {value: "native"});
    addBenchmark(suite, benchmark);
  }

  if (jsdomDoc) {
    if (nativeDoc) {
      benchmark = benchmark.clone();
    }

    // extra space in "jsdom " so that it aligns with "native"
    benchmark.name = name ? name + " :: jsdom " : "jsdom ";
    Object.defineProperty(benchmark, "document", {value: jsdomDoc});
    Object.defineProperty(benchmark, "documentImplementation", {value: "jsdom"});
    addBenchmark(suite, benchmark);
  }

  return suite;
};
