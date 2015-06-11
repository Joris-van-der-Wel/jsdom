"use strict";
const Benchmark = require("benchmark");
const suite = require("../document-suite");

/* jshint -W117, -W098 */

exports["appendChild: no siblings"] = suite({
  setup: function () {
    var parent = [];
    var children = [];
    var i;

    for (i = 0; i < this.count; ++i) {
      parent.push(this.document.createElement("div"));
      children.push(this.document.createElement("div"));
    }

    i = 0;
  },
  fn: function () {
    parent[i].appendChild(children[i]);
    ++i;
  }
});

exports["appendChild: many siblings"] = suite({
  setup: function () {
    var parent = this.document.createElement("div");
    var children = [];
    var i;

    for (i = 0; i < this.count; ++i) {
      children.push(this.document.createElement("div"));
    }

    i = 0;
  },
  fn: function () {
    parent.appendChild(children[i]);
    ++i;
  }
});

exports["appendChild: many parents"] = suite({
  setup: function () {
    var parent = this.document.createElement("div");
    var children = [];
    var i;

    for (i = 0; i < this.count; ++i) {
      children.push(this.document.createElement("div"));
    }

    i = 0;
  },
  fn: function () {
    var child = children[i];
    parent.appendChild(child);
    parent = child;
    ++i;
  }
});

exports["removeChild: no siblings"] = suite({
  setup: function () {
    var parent = [];
    var children = [];
    var i;

    for (i = 0; i < this.count; ++i) {
      parent.push(this.document.createElement("div"));
      children.push(this.document.createElement("div"));
      parent[i].appendChild(children[i]);
    }

    i = 0;
  },
  fn: function () {
    parent[i].removeChild(children[i]);
    ++i;
  }
});

exports["removeChild: many siblings"] = suite({
  setup: function () {
    var parent = this.document.createElement("div");
    var children = [];
    var i;

    for (i = 0; i < this.count; ++i) {
      children.push(this.document.createElement("div"));
      parent.appendChild(children[i]);
    }

    i = 0;
  },
  fn: function () {
    parent.removeChild(children[i]);
    ++i;
  }
});

exports["removeChild: many parents"] = suite({
  setup: function () {
    var parent = this.document.createElement("div");
    var children = [parent];
    var i;

    for (i = 0; i < this.count; ++i) {
      children[i + 1] = this.document.createElement("div");
      children[i].appendChild(children[i + 1]);
    }

    i = 0;
  },
  fn: function () {
    children[i].removeChild(children[i + 1]);
    ++i;
  }
});
