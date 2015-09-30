import $ from 'jquery';
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
  control: {},
  continues: {},
  tags: {
    'text': 1,
    'javascript': 0,
    'css': 0,
  },
};

window.$ = $;

imageLoad([require('../assets/images/terrain.png'),
           require('../assets/images/me.png')], function(terrain, me) {
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
  });
  animate(require('../assets/texts/css.txt'), 'css', function(finished, chunk) {
    $('#style').append(chunk);
  });
  animate(require('../assets/texts/text.txt'), 'text');
});
