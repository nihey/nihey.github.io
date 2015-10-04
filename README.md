<p align="center">
  <a target="_blank" href="http://nihey.github.io">
    <img src="https://raw.githubusercontent.com/nihey/nihey.github.io/development/screenshot.png"/>
  </a>
</p>

# 仁平 / Nihey Takizawa

My Personal Homepage ([here](http://nihey.github.io))

[![Dependency
Status](https://david-dm.org/nihey/nihey.github.io.png)](https://david-dm.org/nihey/nihey.github.io)

# What is this?

This is a HTML5 presentation that will tell you a bit about me.

# How does it work?

Installing & Building

```
$ npm install
$ npm run build
```

This is the project structure:

```
.
├── assets
│   ├── fonts
│   ├── images
│   │   ├── clouds
│   │   │   ├── 1.png
│   │   │   ├── 2.png
│   │   │   ├── 3.png
│   │   │   ├── 4.png
│   │   │   ├── 5.png
│   │   │   └── 6.png
│   │   ├── favicon.png
│   │   ├── me.png
│   │   ├── random-chars
│   │   │   ├── 1.png
│   │   │   ├── 2.png
│   │   │   ├── 3.png
│   │   │   └── 4.png
│   │   └── terrain.png
│   └── texts
│       ├── css.txt
│       ├── javascript.txt
│       └── text.txt
├── environment.json
├── index.html
├── package.json
├── plugins
│   └── html-plugin.js
├── README.md
├── screenshot.png
├── scripts
│   ├── animate.js
│   └── index.js
├── styles
│   ├── index.less
│   └── prefixed.less
└── webpack.config.js
```

There are 5 files that handle most of the ***magic*** on the presentation:

- `assets/texts/text.txt`
- `assets/texts/javascript.txt`
- `assets/texts/css.txt`
- `scrips/animate.js`
- `scripts/index.js`

`scripts/index.js` is our entry point. It'll initialize all the resources the
dynamic javascript will need to operate directly on the user browser. You can
see it exposes a lot of variables onto the browser global scope (via `window`).

```
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
```

`scripts/animation.js` handle most of the hard work:

- It operates the semaphore-like structure at `window.page.tags`.
- It times the presentation character output.
- It calls the `progress` callback so that we may update the page behavior
  according to the content inside each text-box

```
  // Tell animate which text it should input, which element id this text should
  // be output, and which function to call on the callback signal
  animate(require('../assets/texts/javascript.txt'), 'javascript', function(finished, chunk) {
    // This callback function will execute the output chunk
    eval(chunk);
    // Highlight its text if a global highlight function was created
    window.highlight && window.highlight('#javascript');
    // Mark this box as finished if it has finished
    window.page.finished.javascript = finished;
    window.page.checkFinished();
  });
```

`assets/texts/*.txt` files are the content that will be displayed on the
browser. You may notice that there are some special markup on them:

- `**` is the progress markup, it tells `animate` that the `progress` callback
       should be fired on that line

- `++[anything] or --[anything]` tells `animate` that the semaphore-like
  `window.page.tags` should be either incremented or decremented, if a tag
  react zero (or any falsy value), its presentation will stop - e.g.:
  `window.page.tags.javascript = 0; window.page.checkTags()` will make
  JavaScript presentation stop.

- `§` is a slight delay request before proceeding, you can stack those up to
  increase the delay time: `§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§`.

I hope that helps you, feel free to look into this code in any way you want.

# Acknowledgements

- I thank [STRML](http://strml.net) who was the first one I've seen that have
done something like that.

- [OpenGameArt](http://opp.opengameart.org/) provided the images of clouds and
terrain

- [Famitsu](http://www.famitsu.com/freegame/tool/chibi/index2.html) provided the characters' sprites.

# License

This code is released under
[CC0](http://creativecommons.org/publicdomain/zero/1.0/) (Public Domain)
