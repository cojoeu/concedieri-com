/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

