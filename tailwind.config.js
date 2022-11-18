/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
      },
      colors: {
        'mui-blue': 'rgb(25, 118, 210)',
        'darker-blue': '#1461ad'
      },
    },
  },
  plugins: [],
}
