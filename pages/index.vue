<template>
  <main class="min-h-screen bg-gray-900 space-y-16 lg:space-y-32">
    <section class="relative p-8">
      <div class="relative z-10 flex space-x space-x-2">
        <div
          class="w-4 h-4 rounded-full"
          :style="{
            'background': 'var(--red)'
          }"
        />
        <div
          class="w-4 h-4 rounded-full"
          :style="{
            'background': 'var(--yellow)'
          }"
        />
        <div
          class="w-4 h-4 rounded-full"
          :style="{
            'background': 'var(--green)'
          }"
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
            :class="{
              [code.width]: true
            }"
            class="h-4 rounded-full"
          />
        </div>
      </div>
      <div class="absolute top-0 inset-x-0 z-10 py-32 lg:py-40 text-gray-900" style="background: linear-gradient(150deg, rgba(0,0,0,0) 0%, currentColor 50%);">
        <div class="container">
          <h1 class="text-3xl lg:text-6xl font-bold text-white">
            {{ home.description }}
          </h1>
        </div>
      </div>
    </section>
    <section class="container pt-16 pb-64">
      <nuxt-content :document="home" class="max-w-4xl text-gray-500 leading-relaxed" />
    </section>
  </main>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const homes = await $content('home').fetch()
    const home = homes.slice().shift()

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
  head () {
    return {
      script: [{ src: 'https://identity.netlify.com/v1/netlify-identity-widget.js' }],
    }
  },
}
</script>
