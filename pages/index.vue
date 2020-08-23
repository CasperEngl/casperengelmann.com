<template>
  <main class="min-h-screen bg-gray-900 space-y-16 lg:space-y-32">
    <section class="relative p-8">
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
      <div class="py-8 space-y-8">
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
      <div class="absolute top-0 inset-x-0 z-10 py-32 lg:py-40 text-gray-900" style="background: linear-gradient(150deg, rgba(0,0,0,0) 0%, currentColor 40%);">
        <div class="container">
          <h1 class="max-w-6xl text-3xl lg:text-6xl font-bold text-white" v-html="home.headline" />
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
function wrapTextWithColor (text, word, color) {
  return text.replace(word, `<span style="color: ${color};">${word}</span>`)
}

export default {
  async asyncData ({ $content }) {
    const home = await $content('home').fetch()

    home.headline = wrapTextWithColor(home.headline, 'Vue.js', '#42b883')
    home.headline = wrapTextWithColor(home.headline, 'React', '#00d8ff')
    home.headline = wrapTextWithColor(home.headline, 'TypeScript', '#3178c6')
    home.headline = wrapTextWithColor(home.headline, 'PHP', '#8892be')
    home.headline = wrapTextWithColor(home.headline, 'Node.js', '#6cc24a')

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
