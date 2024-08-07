module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,svelte,ts,tsx,vue,md,mdx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
}
