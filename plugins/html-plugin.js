/* XXX This code is experimental, it may be subjected to great changes on the
 * near future.
 */
var $ = require('cheerio'),
    md5 = require('md5'),
    htmlMinify = require('html-minifier').minify,
    fs = require('fs'),
    path = require('path');

function HtmlParserWebpackPlugin() {
  this.files = Array.prototype.slice.call(arguments);
  this.production = false;
}

HtmlParserWebpackPlugin.prototype.apply = function(compiler) {
  this.compiler = compiler;
  // XXX I could try to find a better way to check this.
  // Note: 'compiler.options.debug' options is not ovewritten by cli options
  // when it is on 'webpack.config.js'.
  this.production = process.argv.indexOf('--optimize-minimize') !== -1 ||
                    process.argv.indexOf('-p') !== -1;
  this.files.forEach(function(file) {
    compiler.plugin('emit', this.compile.bind(this, file));
  }, this);
};

/* Iterate through each element href and src tags and parse them */
HtmlParserWebpackPlugin.prototype.compile = function(file, compilation, callback) {
  var input = path.join(this.compiler.context, file);
  var html = $.load(fs.readFileSync(input));
  html('[href],[src]').each(function(i, element) {
    this.parse(element, 'href', compilation);
    this.parse(element, 'src', compilation);
  }.bind(this));

  var htmlSource = html.html();
  if (this.production) {
    htmlSource = htmlMinify(htmlSource, {
      preserveLineBreaks: false,
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
    });
  }
  this.createFile(compilation, file, htmlSource);
  callback();
};

/* If the elementh with the tag includes a '!' prefix, it should be emitted */
HtmlParserWebpackPlugin.prototype.parse = function(element, attr, compilation) {
  var file = $(element).attr(attr);
  // If the element does not have a valid href or src, or if it does not
  // require bundling, don't do anything.
  if (!file || file[0] !== '!') {
    return;
  }
  $(element).attr(attr, this.emit(file.substring(1), compilation));
};

/* Create a file on the dist directory for the resource with a md5 name */
HtmlParserWebpackPlugin.prototype.emit = function(url, compilation) {
  var ext = url.split('.')[1];
  var source = fs.readFileSync(path.join(this.compiler.context, url));
  var filename = md5(source) + '.' + ext;
  this.createFile(compilation, filename, source);
  return filename;
};

HtmlParserWebpackPlugin.prototype.createFile = function(compilation, name, source) {
  compilation.assets[name] = {
    source: function() {
      return source;
    },
    size: function() {
      return source.length;
    },
  };
};

module.exports = HtmlParserWebpackPlugin;
