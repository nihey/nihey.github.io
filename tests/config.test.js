var test = require("node:test");
var assert = require("node:assert/strict");

var defaultConfig = require("../config/default.json");
var productionConfig = require("../config/production.json");

test("environment configs parse and define the DEBUG flag correctly", function() {
  assert.equal(typeof defaultConfig.DEBUG, "boolean");
  assert.equal(typeof productionConfig.DEBUG, "boolean");
  assert.equal(defaultConfig.DEBUG, true, "development should run in debug mode");
  assert.equal(productionConfig.DEBUG, false, "production must not run in debug mode");
});
