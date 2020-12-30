const colors = require('@tailwindcss/postcss7-compat/colors')

module.exports = {
  purge: [
    './public/**/*.html',
    './src/**/*.vue'
  ],
  theme: {
    colors: {
      ...colors,
      teal: colors.teal
    }
  },
  variants: { },
  plugins: []
}
