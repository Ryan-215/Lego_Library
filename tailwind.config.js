/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.ejs`],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['garden'],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}