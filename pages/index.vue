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
        <div class="relative z-10 py-16 lg:py-24 text-gray-900" style="background: linear-gradient(150deg, rgba(0,0,0,0) 0%, currentColor 40%);">
          <div class="container">
            <h1 class="max-w-6xl text-4xl lg:text-6xl font-bold text-white" v-html="home.headline" />
          </div>
        </div>
      </div>
    </section>
    <section class="container pt-16 pb-64">
      <nuxt-content :document="home" class="max-w-4xl text-gray-500 leading-relaxed" />
    </section>
  </main>
</template>

<script>
/**
 * @param {string} text
 * @param {string} word
 * @param {string} color
 * @returns {this} Text
 */
function wrapTextWithColor (text, word, color, textStrokeColor = '') {
  return text.replace(word, `<span style="color: ${color}; -webkit-text-stroke: 2px ${textStrokeColor || 'transparent'}; text-stroke: 2px ${textStrokeColor || 'transparent'}">${word}</span>`)
}

export default {
  async asyncData ({ $content }) {
    const home = await $content('home').fetch()

    home.headline = wrapTextWithColor(home.headline, 'Vue.js', '#42B883')
    home.headline = wrapTextWithColor(home.headline, 'React', '#00D8FF')
    home.headline = wrapTextWithColor(home.headline, 'TypeScript', '#3178C6')
    home.headline = wrapTextWithColor(home.headline, 'PHP', '#8892BE')
    home.headline = wrapTextWithColor(home.headline, 'Node.js', '#6CC24A')
    home.headline = wrapTextWithColor(home.headline, 'Nuxt.js', '#00C68E')
    home.headline = wrapTextWithColor(home.headline, 'Next.js', '#000000', '#FFFFFF')
    home.headline = wrapTextWithColor(home.headline, 'Serverless', '#fd5750')
    home.headline = wrapTextWithColor(home.headline, 'Laravel', '#ff2d21')
    home.headline = wrapTextWithColor(home.headline, 'WordPress', '#0073aa')
    home.headline = wrapTextWithColor(home.headline, 'SQL', '#e08c09')
    home.headline = wrapTextWithColor(home.headline, 'SCSS', '#cf639a')
    home.headline = wrapTextWithColor(home.headline, 'Git', '#f64d29')
    home.headline = wrapTextWithColor(home.headline, 'ES6+', '#f8dc3c')

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
