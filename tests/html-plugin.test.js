var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var md5 = require("md5");

var HtmlParserWebpackPlugin = require("../plugins/html-plugin");

var ROOT = path.join(__dirname, "..");

test("createFile registers an asset with correct source and size", function() {
  var plugin = new HtmlParserWebpackPlugin("index.html");
  var compilation = { assets: {} };

  plugin.createFile(compilation, "foo.txt", "hello world");

  assert.ok(compilation.assets["foo.txt"], "asset should be registered");
  assert.equal(compilation.assets["foo.txt"].source(), "hello world");
  assert.equal(compilation.assets["foo.txt"].size(), 11);
});

test("emit creates an md5-named asset from a real file", function() {
  var plugin = new HtmlParserWebpackPlugin();
  plugin.compiler = { context: ROOT };
  var compilation = { assets: {} };

  var filename = plugin.emit("config/default.json", compilation);
  var source = fs.readFileSync(path.join(ROOT, "config/default.json"));

  assert.equal(filename, md5(source) + ".json");
  assert.ok(compilation.assets[filename], "emitted asset should be registered");
  assert.equal(String(compilation.assets[filename].source()), String(source));
});

test("compile parses index.html and rewrites '!' assets to hashed names", function(t, done) {
  var plugin = new HtmlParserWebpackPlugin("index.html");
  plugin.compiler = { context: ROOT };
  var compilation = { assets: {} };

  plugin.compile("index.html", compilation, function() {
    var asset = compilation.assets["index.html"];
    assert.ok(asset, "processed index.html should be emitted");

    var html = String(asset.source());
    assert.ok(html.indexOf("!assets/") === -1,
              "'!' prefixed references should be rewritten");

    var favicon = fs.readFileSync(path.join(ROOT, "assets/images/favicon.png"));
    var hashedName = md5(favicon) + ".png";
    assert.ok(html.indexOf(hashedName) !== -1,
              "html should reference the hashed favicon");
    assert.ok(compilation.assets[hashedName],
              "hashed favicon asset should be emitted");
    done();
  });
});

test("apply detects production mode from CLI flags", function() {
  var fakeCompiler = { plugin: function() {}, options: {} };

  var plugin = new HtmlParserWebpackPlugin("index.html");
  plugin.apply(fakeCompiler);
  assert.equal(plugin.production, false, "no -p flag means development mode");

  process.argv.push("-p");
  try {
    var productionPlugin = new HtmlParserWebpackPlugin("index.html");
    productionPlugin.apply(fakeCompiler);
    assert.equal(productionPlugin.production, true, "-p flag enables production mode");
  } finally {
    process.argv.pop();
  }
});
