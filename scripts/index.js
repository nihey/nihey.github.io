import $ from 'jquery';
import hljs from 'highlight.js';
import animate from './animate';
import imageLoad from 'image-load';
import Sprite from 'exports?window.Sprite!sprite-js/dist/sprite.min';

// 'page' global variable will store anything we might need to make the
// presentation during the 'eval' calls.
window.page = {
  checkTags: function() {
    Object.keys(this.tags).forEach(function(tag) {
      this.control[tag] || ((this.tags[tag] > 0) && this.continues[tag]());
    }, this);
  },
  checkFinished: function() {
    // Hide skip button once all tags have finished
    var allFinished = Object.keys(this.tags).every(tag => this.finished[tag]);
    allFinished && $('#skip').hide();
  },
  control: {},
  continues: {},
  finished: {},
  tags: {
    'text': 1,
    'javascript': 0,
    'css': 0,
  },
};

window.$ = $;
window.hljs = hljs;

imageLoad([require('../assets/images/terrain.png'),
           require('../assets/images/me.png'),
           require('../assets/images/random-chars/1.png'),
           require('../assets/images/random-chars/2.png'),
           require('../assets/images/random-chars/3.png'),
           require('../assets/images/random-chars/4.png'),
           require('../assets/images/clouds/1.png'),
           require('../assets/images/clouds/2.png'),
           require('../assets/images/clouds/3.png'),
           require('../assets/images/clouds/4.png'),
           require('../assets/images/clouds/5.png'),
           require('../assets/images/clouds/6.png')],
function(terrain, me) {
  $('#skip').click(function() {
    window.page.skip = 1;
    window.page.tags.text = 99;
    window.page.tags.javascript = 99;
    window.page.tags.css = 99;
    window.page.checkTags();
  });

  window.Sprite = Sprite;

  // Initialize the sprite
  me = new Sprite({
    canvas: document.getElementById('canvas'),
    image: me,
    rows: 4,
    columns: 3,
    rowIndex: 2,
    columnIndex: 1,
    columnFrequency: 0,
  });

  window.page.people = Array.prototype.slice.call(arguments, 2, 6);
  window.page.clouds = Array.prototype.slice.call(arguments, 6);

  window.resizeBoxes = function() {
    var height = Math.max(200, window.innerHeight - 220);
    $('#text pre, #javascript pre, #css pre').css({'max-height': height});
  };
  window.resizeBoxes();

  window.page.fixPlatforms = function() {
    // Remove the old platforms
    $('#platforms').html('');

    var length = Math.ceil(window.outerWidth / 96) + 1;
    for(var i = 0; i < length; i++) {
      $('#platforms').append($(window.page.terrain).clone());
    }
  };

  // Keeps the sprite running
  var context = me.context;
  setInterval(function() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    me.draw(0, 0);
  }, 200);

  // Expose global variables to be used on 'eval'
  window.page.me = me;
  window.page.terrain = terrain;

  animate(require('../assets/texts/javascript.txt'), 'javascript', function(finished, chunk) {
    eval(chunk);
    window.highlight && window.highlight('#javascript');
    window.page.finished.javascript = finished;
    window.page.checkFinished();
  });
  animate(require('../assets/texts/css.txt'), 'css', function(finished, chunk) {
    window.highlight && window.highlight('#css');
    $('#style').append(chunk);
    window.page.finished.css = finished;
    window.page.checkFinished();
  });

  var html = '';
  animate(require('../assets/texts/text.txt'), 'text', function(finished, chunk) {
    html += chunk;
    $('#text pre').html(html);

    // Always keep the scrolling bar at the bottom when updating information
    var element = $('#text pre')[0];
    element.scrollTop = element.scrollHeight;
    window.page.finished.text = finished;
    window.page.checkFinished();
  });
});
