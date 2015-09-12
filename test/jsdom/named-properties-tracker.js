"use strict";
const t = require("chai").assert;

const NamedPropertiesTracker = require("../../lib/jsdom/named-properties-tracker");

function joinIterator(values) {
  let joinedValue = "";
  for (const val of values().keys()) {
    joinedValue += (joinedValue ? "," : "") + val;
  }
  return joinedValue;
}

exports["get() should return the tracker previously created by create()"] = () => {
  const obj = {};

  t.isNull(NamedPropertiesTracker.get(obj));
  const tracker = NamedPropertiesTracker.create(obj, () => undefined);
  t.strictEqual(NamedPropertiesTracker.get(obj), tracker);
};

exports["track() and untrack() should do nothing for empty names"] = () => {
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, () => undefined);

  tracker.track(undefined, "foo");
  tracker.track(null, "foo");
  tracker.track("", "foo");
  tracker.untrack(undefined, "foo");
  tracker.untrack(null, "foo");
  tracker.untrack("", "foo");
};

exports["should define a getter which calls the resolver each time"] = () => {
  let state = "bar";
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, (object, name, values) => {
    t.strictEqual(object, obj);
    t.strictEqual(typeof values, "function");
    t.instanceOf(values(), Set);
    return "hello " + name + " " + state + " " + joinIterator(values);
  });

  tracker.track("foo", 123);
  t.strictEqual(obj.foo, "hello foo bar 123");
  state = "baz";
  t.strictEqual(obj.foo, "hello foo baz 123");
  tracker.track("foo", "bla");
  t.strictEqual(obj.foo, "hello foo baz 123,bla");
  tracker.track("foo", 456);
  t.strictEqual(obj.foo, "hello foo baz 123,bla,456");
};

exports["the resolver should receive a `values` argument that is 'live'"] = () => {
  const obj = {};
  let liveValues;
  const tracker = NamedPropertiesTracker.create(obj, (object, name, values) => {
    liveValues = values;
    return "foo";
  });

  tracker.track("foo", 123);
  t.strictEqual(obj.foo, "foo"); // `liveValues` is now set
  t.strictEqual(joinIterator(liveValues), "123");
  tracker.track("foo", "bar");
  t.strictEqual(joinIterator(liveValues), "123,bar");

  tracker.untrack("foo", 123);
  tracker.untrack("foo", "bar");
  // the map entry is now removed, however liveValues should still be live
  t.strictEqual(liveValues().size, 0);
  tracker.track("foo", "baz");
  t.strictEqual(joinIterator(liveValues), "baz");
};

exports["named properties should be enumerable"] = () => {
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, () => "bar");

  tracker.track("foo", 123);
  let found = false;
  for (let key in obj) {
    if (key === "foo") {
      found = true;
    }
  }
  t.ok(found);
};

exports["named properties should be configurable"] = () => {
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, () => "bar");

  tracker.track("foo", 123);
  tracker.track("dog", 456);

  Object.defineProperty(obj, "foo", {
    value: "baz"
  });

  delete obj.dog;

  t.strictEqual(obj.foo, "baz");
  t.notProperty(obj, "dog");
};

exports["named properties should be settable"] = () => {
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, () => "bar");

  tracker.track("foo", 123);
  obj.foo = 10;

  t.strictEqual(obj.foo, 10);
};

exports["a named property should not override an existing property"] = () => {
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, () => "bar");

  obj.foo = 10;
  tracker.track("foo", 123);
  t.strictEqual(obj.foo, 10);

  tracker.untrack("foo", 123);
  t.strictEqual(obj.foo, 10);
};

exports["a named property should not override an existing property, even if undefined"] = () => {
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, () => "bar");

  obj.foo = undefined;
  tracker.track("foo", 123);
  t.isUndefined(obj.foo);
  t.property(obj, "foo");
  t.isUndefined(obj.foo);

  tracker.untrack("foo", 123);
  t.property(obj, "foo");
  t.isUndefined(obj.foo);
};

exports["a named property should not override properties from the prototype"] = () => {
  function Abc() {}
  Abc.prototype.foo = 12345;
  const obj = new Abc();
  const tracker = NamedPropertiesTracker.create(obj, () => "bar");

  tracker.track("foo", 123);
  t.strictEqual(obj.foo, 12345);

  tracker.untrack("foo", 123);
  t.strictEqual(obj.foo, 12345);
};

exports["a named property should not override Object properties"] = () => {
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, () => "bar");
  const props = ["__proto__", "toString", "constructor", "hasOwnProperty", "isPrototypeOf"];

  props.forEach((prop) => {
    const value = obj[prop];
    tracker.track(prop, 123);
    t.strictEqual(obj[prop], value, prop + " should not have been overridden");
  });
};

exports["a named property that has been untracked should not be 'in' the object"] = () => {
  const obj = {};
  const tracker = NamedPropertiesTracker.create(obj, () => "bar");

  tracker.track("foo", 123);
  tracker.untrack("foo", 123);
  t.notProperty(obj, "foo", "descriptor should have been removed");
};
