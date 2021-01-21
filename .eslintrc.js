module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:vue/recommended',
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/prettier',
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    /* 'comma-dangle': [2, 'always-multiline'],
    'vue/no-v-html': 0,
    'no-extend-native': 0, */
  },
};
