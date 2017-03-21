/*!
  * Vue YouTube Embed version 2.1.0
  * under MIT License copyright 2017 kaorun343
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.VueYouTubeEmbed = global.VueYouTubeEmbed || {})));
}(this, (function (exports) { 'use strict';

// fork from https://github.com/brandly/angular-youtube-embed
if (!String.prototype.includes) {
  String.prototype.includes = function () {
    'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1
  };
}

var youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
var timeRegexp = /t=(\d+)[ms]?(\d+)?s?/;

/**
 * get id from url
 * @param  {string} url url
 * @return {string}     id
 */
function getIdFromURL (url) {
  var id = url.replace(youtubeRegexp, '$1');

  if (id.includes(';')) {
    var pieces = id.split(';');

    if (pieces[1].includes('%')) {
      var uriComponent = decodeURIComponent(pieces[1]);
      id = ("http://youtube.com" + uriComponent).replace(youtubeRegexp, '$1');
    } else {
      id = pieces[0];
    }
  } else if (id.includes('#')) {
    id = id.split('#')[0];
  }

  return id
}

/**
 * get time from url
 * @param  {string} url url
 * @return {number}     time
 */
function getTimeFromURL (url) {
  if ( url === void 0 ) url = '';

  var times = url.match(timeRegexp);

  if (!times) {
    return 0
  }

  var full = times[0];
  var minutes = times[1];
  var seconds = times[2];

  if (typeof seconds !== 'undefined') {
    seconds = parseInt(seconds, 10);
    minutes = parseInt(minutes, 10);
  } else if (full.includes('m')) {
    minutes = parseInt(minutes, 10);
    seconds = 0;
  } else {
    seconds = parseInt(minutes, 10);
    minutes = 0;
  }

  return seconds + (minutes * 60)
}

var container = {
  scripts: [],
  events: {},

  run: function run () {
    var this$1 = this;

    this.scripts.forEach(function (callback) {
      callback(this$1.YT);
    });
    this.scripts = [];
  },

  register: function register (callback) {
    var this$1 = this;

    if (this.YT) {
      this.Vue.nextTick(function () {
        callback(this$1.YT);
      });
    } else {
      this.scripts.push(callback);
    }
  }
};

var pid = 0;

var YouTubePlayer = {
  props: {
    playerHeight: {
      type: [String, Number],
      default: '390'
    },
    playerWidth: {
      type: [String, Number],
      default: '640'
    },
    playerVars: {
      type: Object,
      default: function () { return ({
        autoplay: 0,
        time: 0
      }); }
    },
    videoId: {
      type: String
    },
    mute: {
      type: Boolean,
      default: false
    },
    preview: {
      type: Boolean,
      default: false
    }
  },
  render: function render(h) {
    if (!this.activated) {
      var that = this;
      return h('div', {
        on: {
          click: function click() {
            that.activated = true;
            that.$once('ready', function () {
              that.player.playVideo();
            });
            that.register();
          }
        },
        style: {
          position: 'relative'
        }
      }, [
        h('img', {
          attrs: {
            src: this.thumbnail
          },
          style: {
            width: '100%'
          }
        }),
        h('svg', {
          style: {
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '68px',
            height: '48px',
            marginLeft: '-34px',
            marginTop: '-24px'
          },
          domProps: {
            innerHTML: '<path class="ytp-large-play-button-bg" d="m .66,37.62 c 0,0 .66,4.70 2.70,6.77 2.58,2.71 5.98,2.63 7.49,2.91 5.43,.52 23.10,.68 23.12,.68 .00,-1.3e-5 14.29,-0.02 23.81,-0.71 1.32,-0.15 4.22,-0.17 6.81,-2.89 2.03,-2.07 2.70,-6.77 2.70,-6.77 0,0 .67,-5.52 .67,-11.04 l 0,-5.17 c 0,-5.52 -0.67,-11.04 -0.67,-11.04 0,0 -0.66,-4.70 -2.70,-6.77 C 62.03,.86 59.13,.84 57.80,.69 48.28,0 34.00,0 34.00,0 33.97,0 19.69,0 10.18,.69 8.85,.84 5.95,.86 3.36,3.58 1.32,5.65 .66,10.35 .66,10.35 c 0,0 -0.55,4.50 -0.66,9.45 l 0,8.36 c .10,4.94 .66,9.45 .66,9.45 z" fill="#1f1f1e" fill-opacity="0.81"></path><path d="m 26.96,13.67 18.37,9.62 -18.37,9.55 -0.00,-19.17 z" fill="#fff"></path><path d="M 45.02,23.46 45.32,23.28 26.96,13.67 43.32,24.34 45.02,23.46 z" fill="#ccc"></path>'
          }
        })
      ])
    } else {
      return h('div', [h('div', {
        attrs: {
          id: this.elementId
        }
      })])
    }
  },
  watch: {
    playerWidth: 'setSize',
    playerHeight: 'setSize',
    videoId: 'update',
    mute: 'setMute'
  },
  data: function data() {
    pid += 1;
    var activated = true;
    if (this.preview === true) {
      activated = false;
    }
    return {
      elementId: ("youtube-player-" + pid),
      player: null,
      activated: activated
    }
  },
  methods: {
    setSize: function setSize() {
      this.player.setSize(this.playerWidth, this.playerHeight);
    },
    setMute: function setMute(value) {
      if (value) {
        this.player.mute();
      } else {
        this.player.unMute();
      }
    },
    update: function update(videoId) {
      var name = (this.playerVars.autoplay ? 'load' : 'cue') + "VideoById";
      if (this.player.hasOwnProperty(name)) {
        this.player[name](videoId);
      } else {
        setTimeout(function() {
          this.update(videoId);
        }.bind(this), 100);
      }
    },
    register: function register() {
      var this$1 = this;

      container.register(function (YouTube) {
        var ref = this$1;
        var playerHeight = ref.playerHeight;
        var playerWidth = ref.playerWidth;
        var playerVars = ref.playerVars;
        var videoId = ref.videoId;

        this$1.player = new YouTube.Player(this$1.elementId, {
          height: playerHeight,
          width: playerWidth,
          playerVars: playerVars,
          videoId: videoId,
          events: {
            onReady: function (event) {
              this$1.setMute(this$1.mute);
              this$1.$emit('ready', event.target);
            },
            onStateChange: function (event) {
              if (event.data !== -1) {
                this$1.$emit(container.events[event.data], event.target);
              }
            },
            onError: function (event) {
              this$1.$emit('error', event.target);
            }
          }
        });
      });
    }
  },
  computed: {
    thumbnail: function thumbnail() {
      return 'https://img.youtube.com/vi/' + this.videoId + '/0.jpg'
    }
  },
  mounted: function mounted() {
    if (this.activated) {
      this.register();
    }
  },
  beforeDestroy: function beforeDestroy() {
    if (this.player !== null) {
      this.player.destroy();
    }
    delete this.player;
  }
};

function install (Vue) {
  container.Vue = Vue;
  YouTubePlayer.ready = YouTubePlayer.mounted;
  Vue.component('youtube', YouTubePlayer);
  Vue.prototype.$youtube = { getIdFromURL: getIdFromURL, getTimeFromURL: getTimeFromURL };

  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/player_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = function () {
    container.YT = YT;
    var PlayerState = YT.PlayerState;

    container.events[PlayerState.ENDED] = 'ended';
    container.events[PlayerState.PLAYING] = 'playing';
    container.events[PlayerState.PAUSED] = 'paused';
    container.events[PlayerState.BUFFERING] = 'buffering';
    container.events[PlayerState.CUED] = 'cued';

    Vue.nextTick(function () {
      container.run();
    });
  };
}

exports.YouTubePlayer = YouTubePlayer;
exports.getIdFromURL = getIdFromURL;
exports.getTimeFromURL = getTimeFromURL;
exports['default'] = install;

Object.defineProperty(exports, '__esModule', { value: true });

})));
