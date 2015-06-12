#!/usr/bin/env node
"use strict";

const consoleReporter = require("./console-reporter");
const pathToSuites = require("./path-to-suites");
const benchmarks = require(".");

const optimist = require("optimist")
  .usage("Run the jsdom benchmark suite")
  .alias("s", "suites")
  .string("s")
  .describe("s", "suites that you want to run. ie: -s dom/construction/createElement,dom/foo")
  .alias("h", "help")
  .describe("h", "show the help");

if (optimist.argv.help) {
  optimist.showHelp();
  return;
}

let suitesToRun;
if (optimist.argv.suites) {
  suitesToRun = pathToSuites(benchmarks, optimist.argv.suites.trim().split(/,/));
} else {
  suitesToRun = pathToSuites(benchmarks);
}

suitesToRun.forEach(consoleReporter);

function runNext() {
  /* jshint -W040 */
  if (this && this.off) {
    // there is no .once()
    this.off("complete", runNext);
  }

  const suite = suitesToRun.shift();
  if (!suite) {
    console.log("Done!");
    return;
  }

  suite.off("complete", runNext);
  suite.on("complete", runNext);
  suite.run({async: true});
}

runNext();
