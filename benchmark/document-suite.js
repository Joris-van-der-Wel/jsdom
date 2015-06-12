"use strict";
const Benchmark = require("benchmark");
const extend = require("xtend");
const shallowClone = extend;
const jsdomBenchmark = require("./jsdom-benchmark");

// jsdom might be an empty object if omitted by browserify
const jsdom = require("..");

const nativeDoc = global.document;
const jsdomDoc = jsdom.jsdom && jsdom.jsdom();

function noop() {}

function addBenchmark(suite, benchmark) {
  const event = new Benchmark.Event({type: "add", target: benchmark});
  suite.emit(event);
  if (!event.cancelled) {
    suite.push(benchmark);
  }
}

function benchmarkFunctions(document, options) {
  const setup = options.setup || noop;
  const fn = options.fn;
  const teardown = options.teardown || noop;

  return {
    setup: function () { setup.call(this, document); },
    fn: options.defer ?
        function (deferred) { fn.call(this, deferred, document); } :
        function () { fn.call(this, document); },
    teardown: function () { teardown.call(this, document); }
  };
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
                  shallowClone(optionsArg);

  // default to async because that is required for defer:true
  const suite = options.suite || new Benchmark.Suite({async: true});
  delete options.suite; // do not pass to `Benchmark`

  if (nativeDoc) {
    const newOptions = extend(options, benchmarkFunctions(nativeDoc, options));
    const benchmark = jsdomBenchmark(newOptions);
    benchmark.name = benchmark.name ? benchmark.name + " :: native" : "native";
    addBenchmark(suite, benchmark);
  }

  if (jsdomDoc) {
    const newOptions = extend(options, benchmarkFunctions(jsdomDoc, options));
    const benchmark = jsdomBenchmark(newOptions);

    // extra space in "jsdom " so that it aligns with "native"
    benchmark.name = benchmark.name ? benchmark.name + " :: jsdom " : "jsdom ";
    addBenchmark(suite, benchmark);
  }

  return suite;
};
