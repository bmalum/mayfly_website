/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.{html,js}", "./layers.js", "./dist/layers/index.html"], theme: {
    extend: {
      fontFamily: {
        ptsans: ['PTSans', 'sans-serif'],
      }
    },
  },
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        ptsans: ['PTSans', 'sans-serif'],
      },
    },
  },
}

