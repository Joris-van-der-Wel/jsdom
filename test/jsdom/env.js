"use strict";

const t = require("chai").assert;
const env = require("../..").env;
const createVirtualConsole = require("../..").createVirtualConsole;
const serializeDocument = require("../..").serializeDocument;
const path = require("path");
const http = require("http");
const toFileUrl = require("../util").toFileUrl(__dirname);

exports["with invalid arguments"] = done => {
  t.throws(() => env());
  t.throws(() => env({}));
  t.throws(() => env({ html: "abc123" }));
  t.throws(() => env({ done() {} }));
  done();
};

exports["explicit config.html, full document"] = done => {
  env({
    html: "<!DOCTYPE html><html><head><title>Hi</title></head><body>Hello</body></html>",
    url: "http://example.com/",
    done(err, window) {
      t.ifError(err);
      t.equal(serializeDocument(window.document),
        "<!DOCTYPE html><html><head><title>Hi</title></head><body>Hello</body></html>");
      t.equal(window.location.href, "http://example.com/");
      t.equal(window.location.origin, "http://example.com");
      done();
    }
  });
};

exports["explicit config.html, with overriden config.url"] = done => {
  env({
    html: "Hello",
    url: "http://example.com/",
    done(err, window) {
      t.ifError(err);
      t.equal(serializeDocument(window.document), "<html><head></head><body>Hello</body></html>");
      t.equal(window.location.href, "http://example.com/");
      t.equal(window.location.origin, "http://example.com");
      t.equal(window.location.search, "");
      t.equal(window.location.hash, "");
      done();
    }
  });
};

exports["explicit config.html, with overriden config.url including hash"] = done => {
  env({
    html: "Hello",
    url: "http://example.com/#foo",
    done(err, window) {
      t.ifError(err);
      t.equal(window.location.hash, "#foo");
      done();
    }
  });
};

exports["explicit config.html, with overriden config.url including search and hash"] = done => {
  env({
    html: "Hello",
    url: "http://example.com/?foo=bar#baz",
    done(err, window) {
      t.ifError(err);
      t.equal(window.location.search, "?foo=bar");
      t.equal(window.location.hash, "#baz");
      done();
    }
  });
};

exports["explicit config.html, without a config.url"] = done => {
  env({
    html: "<html><head></head><body><p>hello world!</p></body></html>",
    done(err, window) {
      t.ifError(err);
      t.notEqual(window.location.href, null);
      done();
    }
  });
};

exports["explicit config.html, with poorly formatted HTML"] = done => {
  env({
    html: "some poorly<div>formed<b>html</div> fragment",
    done(err, window) {
      t.ifError(err);
      t.notEqual(window.location.href, null);
      done();
    }
  });
};

exports["explicit config.html, a string that is also a valid URL"] = done => {
  env({
    html: "http://example.com/",
    url: "http://example.com/",
    done(err, window) {
      t.ifError(err);
      t.equal(serializeDocument(window.document), "<html><head></head><body>http://example.com/</body></html>");
      t.equal(window.location.href, "http://example.com/");
      done();
    }
  });
};

exports["explicit config.html, a string that is also a valid file"] = done => {
  const body = path.resolve(__dirname, "files/env.html");
  env({
    html: body,
    url: "http://example.com/",
    done(err, window) {
      t.ifError(err);
      t.equal(serializeDocument(window.document), "<html><head></head><body>" + body + "</body></html>");
      t.equal(window.location.href, "http://example.com/");
      done();
    }
  });
};

exports["explicit config.html, an empty string"] = done => {
  env({
    html: "",
    created() {
      done();
    }
  });
};

exports["explicit config.url, valid"] = done => {
  const html = "<html><head><title>Example URL</title></head><body>Example!</body></html>";
  const responseText = "<!DOCTYPE html>" + html;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Length": responseText.length });
    res.end(responseText);
    server.close();
  }).listen(8976);

  env({
    url: "http://localhost:8976/",
    done(err, window) {
      t.ifError(err);
      t.equal(serializeDocument(window.document), responseText);
      t.equal(window.location.href, "http://localhost:8976/");
      t.equal(window.location.origin, "http://localhost:8976");
      done();
    }
  });
};

exports["explicit config.url, invalid"] = done => {
  env({
    url: "http://localhost:8976",
    done(err, window) {
      t.ok(err, "an error should exist");
      t.strictEqual(window, undefined, "window should not exist");
      done();
    }
  });
};

exports["explicit config.file, valid"] = done => {
  const fileName = path.resolve(__dirname, "files/env.html");

  env({
    file: fileName,
    done(err, window) {
      t.ifError(err);
      t.equal(serializeDocument(window.document), `<!DOCTYPE html><html><head>
    <title>hello, Node.js!</title>
  </head>
  <body>\n  \n\n</body></html>`);
      t.equal(window.location.href, toFileUrl(fileName));
      done();
    }
  });
};

exports["explicit config.file, invalid"] = done => {
  env({
    file: "__DOES_NOT_EXIST__",
    done(err, window) {
      t.ok(err, "an error should exist");
      t.strictEqual(window, undefined, "window should not exist");
      done();
    }
  });
};

exports["explicit config.file, with a script"] = done => {
  env({
    file: path.resolve(__dirname, "files/env.html"),
    scripts: [path.resolve(__dirname, "../jquery-fixtures/jquery-1.6.2.js")],
    done(err, window) {
      t.ifError(err);

      const $ = window.jQuery;
      const text = "Let's Rock!";

      $("body").text(text);

      t.equal($("body").text(), text);
      done();
    }
  });
};

exports["explicit config.file, with spaces in the file name"] = done => {
  const fileName = path.resolve(__dirname, "files/folder space/space.html");

  env({
    file: fileName,
    done(err) {
      t.ifError(err);
      done();
    }
  });
};

exports["string, parseable as a URL, valid"] = done => {
  const html = "<html><head><title>Example URL</title></head><body>Example!</body></html>";
  const responseText = "<!DOCTYPE html>" + html;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Length": responseText.length });
    res.end(responseText);
    server.close();
  }).listen(8976);

  env(
    "http://localhost:8976/",
    (err, window) => {
      t.ifError(err);
      t.equal(serializeDocument(window.document), responseText);
      t.equal(window.location.href, "http://localhost:8976/");
      t.equal(window.location.origin, "http://localhost:8976");
      done();
    }
  );
};

exports["string, parseable as a URL, invalid"] = done => {
  env(
    "http://localhost:8976",
    (err, window) => {
      t.ok(err, "an error should exist");
      t.strictEqual(window, undefined, "window should not exist");
      done();
    }
  );
};

exports["string, for an existing filename"] = done => {
  const fileName = path.resolve(__dirname, "files/env.html");

  env(
    fileName,
    (err, window) => {
      t.ifError(err);
      t.equal(serializeDocument(window.document), `<!DOCTYPE html><html><head>
    <title>hello, Node.js!</title>
  </head>
  <body>\n  \n\n</body></html>`);
      t.equal(window.location.href, toFileUrl(fileName));
      done();
    }
  );
};

exports["string, does not exist as a file"] = done => {
  const body = "__DOES_NOT_EXIST__";

  env(
    body,
    (err, window) => {
      t.ifError(err);
      t.equal(serializeDocument(window.document), "<html><head></head><body>" + body + "</body></html>");
      done();
    }
  );
};

exports["string, full HTML document"] = done => {
  env(
    "<!DOCTYPE html><html><head><title>Hi</title></head><body>Hello</body></html>",
    (err, window) => {
      t.ifError(err);
      t.equal(serializeDocument(window.document),
        "<!DOCTYPE html><html><head><title>Hi</title></head><body>Hello</body></html>");
      done();
    }
  );
};

exports["string, HTML content with a null byte"] = done => {
  env(
    "<div>\0</div>",
    (err, window) => {
      t.ifError(err);
      t.ok(window.document.querySelector("div") !== null, "div was parsed");
      done();
    }
  );
};

exports["with a nonexistant script"] = done => {
  env({
    html: "<!DOCTYPE html><html><head></head><body><p>hello world!</p></body></html>",
    scripts: ["path/to/invalid.js", "another/invalid.js"],
    done(err, window) {
      t.equal(err, null);
      t.ok(window.location.href);
      done();
    }
  });
};

exports["with src"] = done => {
  env({
    html: "<!DOCTYPE html><html><head></head><body><p>hello world!</p></body></html>",
    src: "window.attachedHere = 123;",
    done(err, window) {
      t.ifError(err);
      t.ok(window.location.href);
      t.equal(window.attachedHere, 123);
      t.equal(window.document.getElementsByTagName("p").item(0).innerHTML, "hello world!");
      done();
    }
  });
};

exports["with document referrer"] = done => {
  env({
    html: "<!DOCTYPE html><html><head></head><body><p>hello world!</p></body></html>",
    document: { referrer: "https://github.com/tmpvar/jsdom" },
    done(err, window) {
      t.ifError(err);
      t.equal(window.document.referrer, "https://github.com/tmpvar/jsdom");
      done();
    }
  });
};

exports["with document cookie"] = done => {
  const cookie = "key=value";
  const time = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const setcookie = cookie + "; expires=" + time.toGMTString() + "; path=/";
  const routes = {
    "/js": "",
    "/html": "<!DOCTYPE html><html><head><script src=\"/js\"></script></head><body></body></html>"
  };
  const server = http.createServer((req, res) => {
    if (req.url === "/js") {
      t.equal(req.headers.cookie, cookie);
    }

    res.writeHead(200, { "Content-Length": routes[req.url].length });
    res.end(routes[req.url]);
  });

  server.listen(63999, "127.0.0.1", () => {
    env({
      url: "http://127.0.0.1:63999/html",
      document: { cookie: setcookie },
      done(err, window) {
        server.close();
        t.ifError(err);
        t.equal(window.document.cookie, cookie);
        done();
      },
      features: {
        FetchExternalResources: ["script"]
      }
    });
  });
};

exports["with scripts and content retrieved from URLs"] = done => {
  const routes = {
    "/js": "window.attachedHere = 123;",
    "/html": "<a href='/path/to/hello'>World</a>"
  };

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Length": routes[req.url].length });
    res.end(routes[req.url]);
  });

  server.listen(64000, "127.0.0.1", () => {
    env({
      url: "http://127.0.0.1:64000/html",
      scripts: "http://127.0.0.1:64000/js",
      done(err, window) {
        server.close();

        t.ifError(err);
        t.equal(window.location.href, "http://127.0.0.1:64000/html");
        t.equal(window.location.origin, "http://127.0.0.1:64000");
        t.equal(window.attachedHere, 123);
        t.equal(window.document.getElementsByTagName("a").item(0).innerHTML, "World");
        done();
      }
    });
  });
};


exports["should call callbacks correctly"] = done => {
  env({
    html: "<!DOCTYPE html><html><head><script>window.isExecuted = true;" +
          "window.wasCreatedSet = window.isCreated;</script></head><body></body></html>",
    features: {
      FetchExternalResources: ["script"],
      ProcessExternalResources: ["script"],
      SkipExternalResources: false
    },
    created(err, window) {
      t.ifError(err);

      t.notEqual(window.isExecuted, true);
      t.strictEqual(window.wasCreatedSet, undefined);
      window.isCreated = true;
    },
    onload(window) {
      t.strictEqual(window.isCreated, true);
      t.strictEqual(window.isExecuted, true);
      t.strictEqual(window.wasCreatedSet, true);
    },
    done(err, window) {
      t.ifError(err);

      t.strictEqual(window.isCreated, true);
      t.strictEqual(window.isExecuted, true);
      t.strictEqual(window.wasCreatedSet, true);

      done();
    }
  });
};

exports["with configurable resource loader"] = done => {
  env({
    html: "<!DOCTYPE html><html><head><script src='foo.js'></script></head><body></body></html>",
    resourceLoader(resource, callback) {
      callback(null, "window.resourceLoaderWasOverriden = true;");
    },
    features: {
      FetchExternalResources: ["script"],
      ProcessExternalResources: ["script"],
      SkipExternalResources: false
    },
    done(err, window) {
      t.ifError(err);
      t.strictEqual(window.resourceLoaderWasOverriden, true);
      done();
    }
  });
};

exports["with configurable resource loader modifying routes and content"] = done => {
  const routes = {
    "/js/dir/test.js": "window.modifiedRoute = true;",
    "/html": "<!DOCTYPE html><html><head><script src='./test.js'></script></head><body></body></html>"
  };

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Length": routes[req.url].length });
    res.end(routes[req.url]);
  });

  const time = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const cookie = "key=value; expires=" + time.toGMTString() + "; path=/";

  server.listen(64001, "127.0.0.1", () => {
    env({
      document: { cookie },
      url: "http://127.0.0.1:64001/html",
      resourceLoader(resource, callback) {
        t.ok(typeof resource === "object");
        t.ok(typeof resource.url === "object");
        t.equal(resource.cookie, "key=value");
        t.equal(resource.baseUrl, "http://127.0.0.1:64001/html");
        t.ok(typeof resource.defaultFetch === "function");
        t.ok(typeof callback === "function");
        if (/\.js$/.test(resource.url.path)) {
          resource.url.path = "/js/dir" + resource.url.path;
          resource.defaultFetch((err, body) => {
            if (err) {
              callback(err);
            } else {
              callback(null, body + "\nwindow.modifiedContent = true;");
            }
          });
        } else {
          resource.defaultFetch(callback);
        }
      },
      done(err, window) {
        server.close();
        t.ifError(err);
        t.ok(window.modifiedRoute);
        t.ok(window.modifiedContent);
        done();
      },
      features: {
        FetchExternalResources: ["script"],
        ProcessExternalResources: ["script"],
        SkipExternalResources: false
      }
    });
  });
};

exports["script loading errors show up as jsdomErrors in the virtual console"] = done => {
  const virtualConsole = createVirtualConsole();
  virtualConsole.on("jsdomError", error => {
    t.ok(error instanceof Error);
    t.equal(error.message, `Could not load script: "http://localhost:12345/script.js"`);
    t.ok(error.detail);
  });

  env({
    html: "",
    scripts: ["http://localhost:12345/script.js"],
    virtualConsole,
    done(err, window) {
      t.equal(err, null);
      t.ok(window);
      done();
    }
  });
};

exports["done should be called only once, after all src scripts have executed"] = done => {
  const script = "window.a = (typeof window.a !== 'undefined') ? window.a + 1 : 0;";
  let doneCounter = 0;

  env({
    html: "<div></div>",
    src: [script, script, script],
    ProcessExternalResources: ["script"],
    done(err, window) {
      t.ifError(err);

      ++doneCounter;

      t.strictEqual(window.a, 2);
      t.strictEqual(doneCounter, 1);
      done();
    }
  });
};
