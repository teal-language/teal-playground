const colors = require('@tailwindcss/postcss7-compat/colors')

let themeColors = {}
for (name in colors.keys) {
  if (name != "lightBlue") {
    themeColors[name] = colors[name]
  }
}

module.exports = {
  purge: [
    './public/**/*.html',
    './src/**/*.vue'
  ],
  theme: {
    colors: {
      ...themeColors,
      teal: {
        ...themeColors.teal,
        950: '#143c3c'
      }
    }
  },
  variants: { },
  plugins: []
}
