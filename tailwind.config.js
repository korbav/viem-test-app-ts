/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        brightness: {
          '0%': { background:  'rgba(200,230,255,0.5)', filter: 'brightness(1) saturate(0) opacity(0)' },
          '30%': { background: 'rgba(200,230,255,0)',filter: 'brightness(10) saturate(100%) opacity(100)' },
          '60%': { background: 'rgba(200,230,255,0.5)',filter: 'brightness(1) saturate(100%) opacity(100)' },
          '100%': { background:'rgba(200,230,255,0)',filter: 'brightness(1) saturate(100%) opacity(100)' },
        },
      },
      animation: {
        'brightness': 'brightness 0.7s ease-in forwards',
      },
    },
  },
  plugins: [],
}