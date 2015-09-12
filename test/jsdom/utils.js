"use strict";

const t = require("chai").assert;
const utils = require("../../lib/jsdom/utils");

exports["defineSetter defines a setter"] = () => {
  const o = {};
  let called = false;
  const expected = "bar";
  let actual;

  utils.defineSetter(o, "foo", val => {
    called = true;
    actual = val;
  });

  o.foo = expected;
  t.equal(called, true);
  t.equal(actual, expected);
};

exports["defineSetter replaces existing setters"] = () => {
  const o = {};
  let originalCalled = false;
  let newCalled = false;

  utils.defineSetter(o, "foo", () => originalCalled = true);
  utils.defineSetter(o, "foo", () => newCalled = true);

  o.foo = true;
  t.equal(originalCalled, false);
  t.equal(newCalled, true);
};

exports["defineSetter does not remove existing getters"] = () => {
  const o = {};
  let called = false;
  const expected = "bar";
  let actual;

  utils.defineGetter(o, "foo", () => {
    called = true;
    return expected;
  });

  utils.defineSetter(o, "foo", () => { });

  actual = o.foo;
  t.equal(called, true);
  t.equal(actual, expected);
};

exports["defineGetter defines a getter"] = () => {
  const o = {};
  let called = false;
  const expected = "bar";
  let actual;

  utils.defineGetter(o, "foo", () => {
    called = true;
    return expected;
  });

  actual = o.foo;
  t.equal(called, true);
  t.equal(actual, expected);
};

exports["defineGetter replaces existing getters"] = () => {
  const o = {};
  let originalCalled = false;
  let newCalled = false;

  utils.defineGetter(o, "foo", () => originalCalled = true);
  utils.defineGetter(o, "foo", () => newCalled = true);

  /* eslint-disable no-unused-expressions */
  o.foo;
  /* eslint-enable no-unused-expressions */

  t.equal(originalCalled, false);
  t.equal(newCalled, true);
};

exports["defineGetter does not remove existing setters"] = () => {
  const o = {};
  let called = false;
  const expected = "bar";
  let actual;

  utils.defineSetter(o, "foo", val => {
    called = true;
    actual = val;
  });

  utils.defineGetter(o, "foo", () => { });

  o.foo = expected;
  t.equal(called, true);
  t.equal(actual, expected);
};

exports["createFrom returns an object with the given [[Prototype]]"] = () => {
  const proto = {};

  const o = utils.createFrom(proto);
  t.strictEqual(Object.getPrototypeOf(o), proto);
};


exports["createFrom returns an object extended with the given properties"] = () => {
  const properties = {
    get accessor() {},
    set accessor(value) {},
    foo: "bar"
  };

  Object.defineProperties(properties, {
    frozen: {
      value: "brrr",
      configurable: false,
      writable: false
    },
    hidden: {
      value: "shhh",
      enumerable: false
    }
  });

  const o = utils.createFrom({}, properties);

  for (const name of Object.getOwnPropertyNames(o)) {
    t.deepEqual(Object.getOwnPropertyDescriptor(o, name),
      Object.getOwnPropertyDescriptor(properties, name),
      name + " descriptors should be deeply equal"
    );
  }
};

exports["inheritFrom sets Subclass.prototype to an object w/ [[Prototype]] Superclass.prototype"] = () => {
  function Subclass() {}
  function Superclass() {}

  utils.inheritFrom(Superclass, Subclass);

  t.strictEqual(Object.getPrototypeOf(Subclass.prototype),
    Superclass.prototype);
};

exports["inheritFrom sets Subclass.prototype.constructor to Subclass"] = () => {
  function Subclass() {}
  function Superclass() {}

  utils.inheritFrom(Superclass, Subclass);

  t.strictEqual(Subclass.prototype.constructor, Subclass);
};

exports["inheritFrom extends Subclass.prototype with the given properties"] = () => {
  function Subclass() {}
  function Superclass() {}
  const properties = {
    get accessor() {},
    set accessor(value) {},
    foo: "bar"
  };

  Object.defineProperties(properties, {
    frozen: {
      value: "brrr",
      configurable: false,
      writable: false
    },
    hidden: {
      value: "shhh",
      enumerable: false
    }
  });

  utils.inheritFrom(Superclass, Subclass, properties);

  for (const name of Object.getOwnPropertyNames(Subclass.prototype)) {
    t.deepEqual(
      Object.getOwnPropertyDescriptor(Subclass.prototype, name),
      Object.getOwnPropertyDescriptor(properties, name),
      name + " descriptors should be deeply equal"
    );
  }
};

exports["isValidTargetOrigin properly validates target origin"] = () => {
  t.strictEqual(utils.isValidTargetOrigin("*"), true);
  t.strictEqual(utils.isValidTargetOrigin("/"), true);
  t.strictEqual(utils.isValidTargetOrigin("https://www.google.com/"), true);
  t.strictEqual(utils.isValidTargetOrigin("https://www.google.com"), true);
  t.strictEqual(utils.isValidTargetOrigin("http://www.google.com/"), true);
  t.strictEqual(utils.isValidTargetOrigin("http://www.google.com"), true);

  t.strictEqual(utils.isValidTargetOrigin("www.google.com/"), false);
  t.strictEqual(utils.isValidTargetOrigin("www.google.com"), false);
  t.strictEqual(utils.isValidTargetOrigin("google.com"), false);
  t.strictEqual(utils.isValidTargetOrigin("google"), false);
  t.strictEqual(utils.isValidTargetOrigin("?"), false);
};
