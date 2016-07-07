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
           require('../assets/images/water.png'),
           require('../assets/images/me.png'),
           require('../assets/images/unknown-beauty.png'),
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
function(terrain, water, me, beauty) {
  let skip = function() {
    window.page.skip = 1;
    window.page.tags.text = 99;
    window.page.tags.javascript = 99;
    window.page.tags.css = 99;
    window.page.checkTags();
  };

  $('#skip').click(skip);

  window.Sprite = Sprite;

  // Initialize the sprites
  me = new Sprite({
    canvas: document.getElementById('canvas'),
    image: me,
    rows: 4,
    columns: 3,
    rowIndex: 2,
    columnIndex: 1,
    columnFrequency: 0,
  });

  beauty = new Sprite({
    canvas: document.getElementById('beauty-canvas'),
    image: beauty,
    rows: 4,
    columns: 3,
    rowIndex: 2,
    columnIndex: 1,
    columnFrequency: 0,
  });

  window.page.people = Array.prototype.slice.call(arguments, 4, 8);
  window.page.clouds = Array.prototype.slice.call(arguments, 8);

  window.resizeBoxes = function() {
    var height = Math.max(200, window.innerHeight - 220);
    $('#text pre, #javascript pre, #css pre').css({'max-height': height});
  };
  window.resizeBoxes();

  window.page.fixPlatforms = function() {
    // Remove the old platforms
    $('#platforms').html('');
    $('#water').html('');

    var length = Math.ceil(window.outerWidth / 96) + 1;
    for(var i = 0; i < length; i++) {
      $('#platforms').append($(window.page.terrain).clone());
      $('#water').append($(window.page.water).clone());
    }
  };

  // Keeps the sprite running
  setInterval(function() {
    me.context.clearRect(0, 0, me.context.canvas.width, me.context.canvas.height);
    beauty.context.clearRect(0, 0, beauty.context.canvas.width, beauty.context.canvas.height);
    me.draw(0, 0);
    beauty.draw(0, 0);
  }, 200);

  // Expose global variables to be used on 'eval'
  window.page.me = me;
  window.page.beauty = beauty;
  window.page.terrain = terrain;
  window.page.water = water;

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

  // Finally, display the skip button
  $('#skip').css({opacity: 1});

  // Execute link anchored actions (if any)
  let actions = location.hash.substr(3).split('/');
  // Skip
  if (actions.indexOf('skip') !== -1) {
    skip();
  }

  // *-main routes
  if (actions.indexOf('javascript-main') !== -1) {
    $('#text').css({width: '25%', 'font-size': '0.6em'});
    $('#css').css({width: '25%'});
    $('#javascript').css({width: '50%', 'font-size': '1em'});
  }
  if (actions.indexOf('css-main') !== -1) {
    $('#text').css({width: '25%', 'font-size': '0.6em'});
    $('#javascript').css({width: '25%'});
    $('#css').css({width: '50%', 'font-size': '1em'});
  }

  // *-only routes
  if (actions.indexOf('html-only') !== -1) {
    $('#javascript').css({display: 'none'});
    $('#css').css({display: 'none'});
    $('#text').css({width: '100%', 'font-size': '1em'});
  }
  if (actions.indexOf('javascript-only') !== -1) {
    $('#text').css({display: 'none'});
    $('#css').css({display: 'none'});
    $('#javascript').css({width: '100%', 'font-size': '1em'});
  }
  if (actions.indexOf('css-only') !== -1) {
    $('#text').css({display: 'none'});
    $('#javascript').css({display: 'none'});
    $('#css').css({width: '100%', 'font-size': '1em'});
  }
});

if (!Environment.DEBUG) {
  ga('create', 'UA-67879786-1', 'auto');
  ga('send', 'pageview');
}
