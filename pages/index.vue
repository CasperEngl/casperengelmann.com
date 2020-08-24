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
          <div class="container space-y-8 lg:space-y-16">
            <h1 class="max-w-6xl text-4xl lg:text-6xl font-bold text-white space-x-4 cursor-default">
              <vue-typed-js
                :strings="home.skill_prefixes"
                :loop="true"
                :show-cursor="false"
                :back-speed="75"
                :type-speed="100"
                :back-delay="5000"
              >
                <span><span class="typing text-gray-500" />{{ home.skill_variable }} =<br></span>
              </vue-typed-js>
              <span>[</span>
              <span
                v-for="(skill, index) in skills"
                :key="skill.name"
                class="group inline-flex"
                :style="{
                  color: skill.color,
                  textStroke: `1px ${skill.stroke || 'transparent'}`,
                }"
              >
                <span class="inline-block group-hover:underline transform group-hover:-translate-y-1 group-hover:scale-105 origin-bottom transition duration-150">'{{ skill.name }}'</span>
                <span v-if="index < skills.length - 1" class="text-white">,</span>
              </span>
              <span>]</span>
            </h1>
            <client-only>
              <div v-cloak class="flex flex-col items-center space-y-4">
                <h2 class="text-gray-700 text-7xl font-bold">
                  Socials
                </h2>
                <div class="flex space-x-4">
                  <a
                    v-for="social in socials"
                    :key="social.brand"
                    :href="social.url"
                    target="blank"
                    class="transform hover:-translate-y-1 hover:scale-105 origin-bottom transition duration-150"
                  >
                    <img :src="social.icon" :alt="social.brand" class="w-16 text-white hover:text-gray-400 transition duration-150" onload="SVGInject(this)">
                  </a>
                </div>
              </div>
            </client-only>
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
export default {
  async asyncData ({ $content }) {
    const [home, skills, socials] = await Promise.all([
      $content('home').fetch(),
      $content('skills').sortBy('name').fetch(),
      $content('socials').sortBy('brand').fetch(),
    ])

    return {
      home,
      skills,
      socials,
    }
  },
  data: vm => ({
    home: null,
    skills: null,
    socials: null,
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
      script: [
        { src: 'https://identity.netlify.com/v1/netlify-identity-widget.js' },
        { src: 'https://unpkg.com/@iconfu/svg-inject@1.2.3/dist/svg-inject.js' },
      ],
    }
  },
}
</script>
