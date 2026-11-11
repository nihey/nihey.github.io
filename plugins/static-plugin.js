/* Emit every file in a directory as-is at the root of the output, for files
 * that need a stable URL (robots.txt, sitemap.xml, og-image.png).
 */
var fs = require("fs"),
    path = require("path");

function StaticWebpackPlugin(directory) {
  this.directory = directory;
}

StaticWebpackPlugin.prototype.apply = function(compiler) {
  var directory = path.join(compiler.context, this.directory);
  compiler.hooks.emit.tap("StaticWebpackPlugin", function(compilation) {
    fs.readdirSync(directory).forEach(function(name) {
      var source = fs.readFileSync(path.join(directory, name));
      compilation.assets[name] = {
        source: function() {
          return source;
        },
        size: function() {
          return source.length;
        },
      };
    });
  });
};

module.exports = StaticWebpackPlugin;
