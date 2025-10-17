/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        'screen-navbar': 'calc(100vh - 64px)',
      },
    },
  },
  plugins: [],
}

