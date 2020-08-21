<template>
  <main class="min-h-screen bg-gray-900">
    <div class="relative p-8">
      <figure class="fixed inset-0 w-full h-full flex items-center">
        <div
          class="w-0 h-0"
          :style="{
            borderTop: '100vh solid transparent',
            borderLeft: '0vw solid transparent',
            borderRight: '100vw solid #2d3748',
            borderBottom: '0vh solid #2d3748',
          }"
        />
      </figure>
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
      <div class="absolute top-0 inset-x-0 z-10 py-64 text-gray-900" style="background: linear-gradient(150deg, rgba(0,0,0,0) 0%, currentColor 50%);">
        <div class="container">
          <h1 class="text-8xl font-bold text-white" style="">
            Vue.js, React, TypeScript, PHP and Node.js
          </h1>
        </div>
      </div>
    </div>
    <div class="py-64 h-screen bg-gray-800 relative z-10" />
    <div class="py-64" />
    <div class="py-64 h-screen bg-gray-900 relative z-10" />
    <div class="py-64" />
    <div class="py-64" />
  </main>
</template>

<script>
export default {
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

<style>
</style>
