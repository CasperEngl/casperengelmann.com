const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  experimental: {
    extendedFontSizeScale: true,
    applyComplexClasses: true,
  },
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    fontFamily: {
      sans: ['Ubuntu', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      minHeight: {
        64: '16rem',
      },
    },
  },
  variants: {
    translate: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
    scale: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
  },
  plugins: [],
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.NODE_ENV === 'production',
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'nuxt.config.js',
    ],
  },
}
