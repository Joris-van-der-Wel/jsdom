"use strict";
const suite = require("../document-suite");

exports["appendChild: no siblings"] = (function () {
  let parent;
  let children;
  let it;

  return suite({
    setup: function (document) {
      parent = [];
      children = [];

      for (let i = 0; i < this.count; ++i) {
        parent.push(document.createElement("div"));
        children.push(document.createElement("div"));
      }

      it = 0;
    },
    fn: function () {
      parent[it].appendChild(children[it]);
      ++it;
    }
  });
}());

exports["appendChild: many siblings"] = (function () {
  let parent;
  let children;
  let it;

  return suite({
    setup: function (document) {
      parent = document.createElement("div");
      children = [];

      for (let i = 0; i < this.count; ++i) {
        children.push(document.createElement("div"));
      }

      it = 0;
    },
    fn: function () {
      parent.appendChild(children[it]);
      ++it;
    }
  });
}());

exports["appendChild: many parents"] = (function () {
  let parent;
  let children;
  let it;

  return suite({
    setup: function (document) {
      parent = document.createElement("div");
      children = [];

      for (let i = 0; i < this.count; ++i) {
        children.push(document.createElement("div"));
      }

      it = 0;
    },
    fn: function () {
      const child = children[it];
      parent.appendChild(child);
      parent = child;
      ++it;
    }
  });
}());

exports["removeChild: no siblings"] = (function () {
  let parent;
  let children;
  let it;

  return suite({
    setup: function (document) {
      parent = [];
      children = [];

      for (let i = 0; i < this.count; ++i) {
        parent.push(document.createElement("div"));
        children.push(document.createElement("div"));
        parent[i].appendChild(children[i]);
      }

      it = 0;
    },
    fn: function () {
      parent[it].removeChild(children[it]);
      ++it;
    }
  });
}());

exports["removeChild: many siblings"] = (function () {
  let parent;
  let children;
  let it;

  return suite({
    setup: function (document) {
      parent = document.createElement("div");
      children = [];

      for (let i = 0; i < this.count; ++i) {
        children.push(document.createElement("div"));
        parent.appendChild(children[i]);
      }

      it = 0;
    },
    fn: function () {
      parent.removeChild(children[it]);
      ++it;
    }
  });
}());

exports["removeChild: many parents"] = (function () {
  let parent;
  let children;
  let it;

  return suite({
    setup: function (document) {
      parent = document.createElement("div");
      children = [parent];

      for (let i = 0; i < this.count; ++i) {
        children[i + 1] = document.createElement("div");
        children[i].appendChild(children[i + 1]);
      }

      it = 0;
    },
    fn: function () {
      children[it].removeChild(children[it + 1]);
      ++it;
    }
  });
}());
