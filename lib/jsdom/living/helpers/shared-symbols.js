"use strict";

exports.cloningSteps = Symbol("cloning steps");

/** A property on `Node`, it stores the node index of that Node.
 * The type is a Number if the node has a parent, null otherwise.
 */
exports.nodeIndex = Symbol("node index");

// TODO: the many underscore-prefixed hooks should move here
// E.g. _attrModified (which maybe should be split into its per-spec variants)
