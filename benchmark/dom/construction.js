"use strict";
const suite = require("../document-suite");

exports.createElement = suite(function () {
  this.document.createElement("div");
});

exports.createTextNode = suite(function () {
  this.document.createTextNode("foo");
});

exports.createComment = suite(function () {
  this.document.createComment("foo");
});

exports.createDocumentFragment = suite(function () {
  this.document.createDocumentFragment("foo");
});

exports.createNodeIterator = suite(function () {
  this.document.createNodeIterator(this.document.documentElement);
});

exports.createEvent = suite(function () {
  this.document.createEvent("Event");
});

exports.createProcessingInstruction = suite(function () {
  this.document.createProcessingInstruction("php", "echo 123; ?");
});

