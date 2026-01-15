/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        drukwide: ['DrukCond', 'sans-serif'],
        nimbus: ['Nimbus', 'sans-serif'],
      }
    }
  },
  plugins: []
}