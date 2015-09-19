import $ from 'jquery';

export default function(text, tag, progress=function(){}) {
  var lines = text.split('\n');
  var element = $(`#${tag} > pre`);

  var putLine = function(line, callback) {
    var index = 0;
    var end = function(breakLine) {
      breakLine && element.append('\n');
      callback();
    };

    var putChar = function() {
      var character = line[index++];
      if (character === '§') {
        return setTimeout(putChar, 300);
      }
      if (character === '\\' && line.length === index) {
        return end(false);
      }

      // Always scroll to the bottom when typing
      element[0].scrollTop = element[0].scrollHeight;

      element.append(character);
      index < line.length && setTimeout(putChar, 0);
      index < line.length || end(true);
    };

    setTimeout(putChar, 0);
  };

  var index = 0;
  var callback = function() {
    // Always scroll to the bottom when typing
    element[0].scrollTop = element[0].scrollHeight;

    // If the tag value is 0, pause the presentation
    if (window.page.tags[tag] === 0) {
      window.page.control[tag] = false;
      return;
    }
    window.page.control[tag] = true;

    var line = lines[index++];

    if (line == undefined) {
      // Undefined line === end of presentation
      return progress(true);
    }
    else if (line.substr(0, 2) === '**') {
      // ** line === call the progress callback and continue
      progress(false);
    }
    else if (line.substr(0, 2) === '++') {
      // ++[tag] line === increment a tag
      ++window.page.tags[line.replace('++', '') || tag];
      window.page.checkTags();
      return callback();
    }
    else if (line.substr(0, 2) === '--') {
      // --[tag] === decrement a tag
      --window.page.tags[line.replace('--', '') || tag];
      window.page.checkTags();
      return callback();
    }

    putLine(line, callback);
  };

  window.page.continues[tag] = callback;
  callback();
};
