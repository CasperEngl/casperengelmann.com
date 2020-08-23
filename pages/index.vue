<template>
  <main class="min-h-screen bg-gray-900 space-y-16 lg:space-y-32">
    <section class="relative p-8">
      <div class="overflow-hidden">
        <div class="relative z-20 flex space-x space-x-2">
          <div
            class="w-4 h-4 rounded-full cursor-pointer"
            :style="{
              'background': 'var(--red)'
            }"
            @click="alert('It didn\'t work!. Sadly, modern browsers no longer lets us close the current tab.')"
          />
          <div
            class="w-4 h-4 rounded-full cursor-pointer"
            :style="{
              'background': 'var(--yellow)'
            }"
            @click="alert('Much like closing the tab, minimizing the window doesn\'t work either. No fun!')"
          />
          <div
            class="w-4 h-4 rounded-full cursor-pointer"
            :style="{
              'background': 'var(--green)'
            }"
            @click="launchFullscreen"
          />
        </div>
        <div class="absolute inset-0 z-0 py-24 px-8 space-y-8">
          <div v-for="(codeLine, i) in codeLines" :key="i" class="relative overflow-hidden flex justify-start rounded-full w-full space-x-4">
            <div
              v-for="(code, j) in codeLine"
              :key="j"
              :style="{
                background: `var(${code.color})`,
              }"
              :class="code.width"
              class="h-4 rounded-full"
            />
          </div>
        </div>
        <div class="relative z-10 pt-16 pb-8 lg:pt-24 text-gray-900 min-h-64" style="background: linear-gradient(150deg, rgba(0,0,0,0) 0%, currentColor 40%);">
          <div class="container">
            <h1 class="max-w-6xl text-4xl lg:text-6xl font-bold text-white" v-html="home.headline" />
          </div>
        </div>
      </div>
    </section>
    <section class="container pb-64">
      <nuxt-content :document="home" class="max-w-4xl text-gray-500 leading-relaxed" />
    </section>
  </main>
</template>

<script>
/**
 * @param {string} word
 * @param {string} color
 * @param {string} [textStrokeColor] textStrokeColor
 * @returns {string}
 */
function wrapTextWithColor (word, color, textStrokeColor = '#333') {
  return this.replace(word, `<span style="color: ${color}; -webkit-text-stroke: 1px ${textStrokeColor || 'transparent'}; text-stroke: 1px ${textStrokeColor || 'transparent'}">${word}</span>`)
}

String.prototype.wrapTextWithColor = wrapTextWithColor

export default {
  async asyncData ({ $content }) {
    const home = await $content('home').fetch()

    home.headline = home.headline
      .wrapTextWithColor('Vue.js', '#42B883')
      .wrapTextWithColor('React', '#00D8FF')
      .wrapTextWithColor('TypeScript', '#3178C6')
      .wrapTextWithColor('PHP', '#8892BE')
      .wrapTextWithColor('Node.js', '#6CC24A')
      .wrapTextWithColor('Nuxt.js', '#00C68E')
      .wrapTextWithColor('Next.js', '#000000', '#FFFFFF')
      .wrapTextWithColor('Serverless', '#fd5750')
      .wrapTextWithColor('Laravel', '#ff2d21')
      .wrapTextWithColor('WordPress', '#0073aa')
      .wrapTextWithColor('SQL', '#e08c09')
      .wrapTextWithColor('SCSS', '#cf639a')
      .wrapTextWithColor('Git', '#f64d29')
      .wrapTextWithColor('ES6+', '#f8dc3c')

    return {
      home,
    }
  },
  data: () => ({
    codeLines: [
      [
        {
          width: 'w-4/12',
          color: '--gray',
        },
        {
          width: 'w-4/12',
          color: '--blue',
        },
      ],
      [
        {
          width: 'w-1/12',
          color: '--red',
        },
        {
          width: 'w-4/12',
          color: '--purple',
        },
        {
          width: 'w-3/12',
          color: '--yellow',
        },
        {
          width: 'w-2/12',
          color: '--green',
        },
      ],
      [
        {
          width: 'w-3/12',
          color: '--blue',
        },
        {
          width: 'w-2/12',
          color: '--green',
        },
        {
          width: 'w-7/12',
          color: '--gray',
        },
      ],
      [
        {
          width: 'w-5/12',
          color: '--yellow',
        },
        {
          width: 'w-6/12',
          color: '--red',
        },
        {
          width: 'w-7/12',
          color: '--indigo',
        },
      ],
      [
        {
          width: 'w-8/12',
          color: '--slate',
        },
        {
          width: 'w-1/12',
          color: '--light',
        },
        {
          width: 'w-2/12',
          color: '--yellow',
        },
      ],
      [
        {
          width: 'w-3/12',
          color: '--green',
        },
        {
          width: 'w-7/12',
          color: '--red',
        },
        {
          width: 'w-4/12',
          color: '--gray',
        },
      ],
    ],
  }),
  methods: {
    alert (message) {
      alert(message)
    },
    isFullscreen () {
      return window.innerHeight === screen.height
    },
    launchFullscreen () {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen()
      }
    },
  },
  head () {
    return {
      script: [{ src: 'https://identity.netlify.com/v1/netlify-identity-widget.js' }],
    }
  },
}
</script>
