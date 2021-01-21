<template>
  <main class="lg:space-y-32 min-h-screen space-y-16 bg-gray-900">
    <section class="relative p-8">
      <div class="relative overflow-hidden">
        <div class="space-x relative z-20 flex space-x-2">
          <div
            class="w-3 h-3 rounded-full cursor-pointer"
            :style="{
              background: 'var(--red)',
            }"
            @click="
              alert(
                'It didn\'t work!. Sadly, modern browsers no longer lets us close the current tab.'
              )
            "
          />
          <div
            class="w-3 h-3 rounded-full cursor-pointer"
            :style="{
              background: 'var(--yellow)',
            }"
            @click="
              alert(
                'Much like closing the tab, minimizing the window doesn\'t work either. No fun!'
              )
            "
          />
          <div
            class="w-3 h-3 rounded-full cursor-pointer"
            :style="{
              background: 'var(--green)',
            }"
            @click="launchFullscreen"
          />
        </div>
        <div class="absolute inset-0 z-0 py-24 space-y-6">
          <div
            v-for="(codeline, i) in $options.codelines"
            :key="i"
            class="relative flex justify-start w-full space-x-3 overflow-hidden rounded-full"
          >
            <div
              v-for="(code, j) in codeline"
              :key="j"
              :style="{
                background: `var(${code.color})`,
              }"
              :class="code.width"
              class="h-3 rounded-full"
            />
          </div>
        </div>
        <div
          class="lg:pt-24 min-h-64 relative z-10 pt-16 pb-8 text-gray-900"
          style="background: linear-gradient(150deg, rgba(0, 0, 0, 0) 0%, currentColor 40%);"
        >
          <div class="lg:space-y-16 container space-y-8">
            <h1
              class="lg:text-6xl max-w-6xl -mx-4 space-x-4 text-4xl font-bold text-white cursor-default"
            >
              <vue-typed-js
                :strings="home.skill_prefixes"
                :loop="true"
                :show-cursor="false"
                :back-speed="75"
                :type-speed="100"
                :back-delay="5000"
                class="ml-4"
              >
                <div><span class="typing text-gray-500" />{{ home.skill_variable }} =<br /></div>
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
                <span
                  class="group-hover:underline group-hover:-translate-y-1 group-hover:scale-105 inline-block transition duration-150 origin-bottom transform"
                  >'{{ skill.name }}'</span
                >
                <span v-if="index < skills.length - 1" class="text-white">,</span>
              </span>
              <span>]</span>
            </h1>
            <client-only>
              <div v-cloak class="flex flex-col items-center space-y-4">
                <h2 class="lg:text-7xl text-3xl font-bold text-gray-700">Socials</h2>
                <div class="lg:space-x-8 flex space-x-6">
                  <a
                    v-for="social in socials"
                    :key="social.brand"
                    :href="social.url"
                    target="blank"
                    class="hover:-translate-y-1 hover:scale-105 transition duration-150 origin-bottom transform"
                  >
                    <img
                      :src="social.icon"
                      :alt="social.brand"
                      class="lg:w-16 hover:text-gray-400 w-12 text-white transition duration-150"
                      onload="SVGInject(this)"
                    />
                  </a>
                </div>
              </div>
            </client-only>
          </div>
        </div>
      </div>
    </section>
    <section class="container pb-64">
      <nuxt-content :document="home" class="max-w-4xl leading-relaxed text-gray-500" />
    </section>
  </main>
</template>

<script>
import { codelines } from '~/utils/codelines';

export default {
  codelines,
  async asyncData({ $content }) {
    const [home, skills, socials] = await Promise.all([
      $content('home').fetch(),
      $content('skills')
        .sortBy('name')
        .fetch(),
      $content('socials')
        .sortBy('brand')
        .fetch(),
    ]);

    return {
      home,
      skills,
      socials,
    };
  },
  data: () => ({
    home: null,
    skills: null,
    socials: null,
  }),
  head() {
    return {
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/@iconfu/svg-inject@1.2.3/dist/svg-inject.min.js',
        },
        {
          src: 'https://cdn.jsdelivr.net/npm/@casperengl/try-catch@1.7.0/lib/index.js',
        },
      ],
    };
  },
  methods: {
    alert(message) {
      alert(message);
    },
    isFullscreen() {
      return window.innerHeight === screen.height;
    },
    launchFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    },
  },
};
</script>
