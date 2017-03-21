import container from './container'

let pid = 0

export default {
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
      default: () => ({
        autoplay: 0,
        time: 0
      })
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
  render(h) {
    if (!this.activated) {
      let that = this
      return h('div', {
        on: {
          click() {
            that.activated = true
            that.$once('ready', () => {
              that.player.playVideo()
            })
            that.register()
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
  data() {
    pid += 1
    let activated = true
    if (this.preview === true) {
      activated = false
    }
    return {
      elementId: `youtube-player-${pid}`,
      player: null,
      activated: activated
    }
  },
  methods: {
    setSize() {
      this.player.setSize(this.playerWidth, this.playerHeight)
    },
    setMute(value) {
      if (value) {
        this.player.mute()
      } else {
        this.player.unMute()
      }
    },
    update(videoId) {
      const name = `${this.playerVars.autoplay ? 'load' : 'cue'}VideoById`
      if (this.player.hasOwnProperty(name)) {
        this.player[name](videoId)
      } else {
        setTimeout(function() {
          this.update(videoId)
        }.bind(this), 100)
      }
    },
    register() {
      container.register((YouTube) => {
        const {
          playerHeight,
          playerWidth,
          playerVars,
          videoId
        } = this

        this.player = new YouTube.Player(this.elementId, {
          height: playerHeight,
          width: playerWidth,
          playerVars,
          videoId,
          events: {
            onReady: (event) => {
              this.setMute(this.mute)
              this.$emit('ready', event.target)
            },
            onStateChange: (event) => {
              if (event.data !== -1) {
                this.$emit(container.events[event.data], event.target)
              }
            },
            onError: (event) => {
              this.$emit('error', event.target)
            }
          }
        })
      })
    }
  },
  computed: {
    thumbnail() {
      return 'https://img.youtube.com/vi/' + this.videoId + '/0.jpg'
    }
  },
  mounted() {
    if (this.activated) {
      this.register()
    }
  },
  beforeDestroy() {
    if (this.player !== null) {
      this.player.destroy()
    }
    delete this.player
  }
}
