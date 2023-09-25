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
          '0%':  {   filter: "blur(1.5px) invert(0.3)", "mask-image": 'linear-gradient(to right, rgba(0, 0, 0, 1),  rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1))', "mask-size": "0% 100%", background:  'rgba(255,255,255,1)' },
          '10%': {  background:  'rgba(210,240,255,1)' },
          '20%': {  background:  'rgba(255,255,255,1)' },
          '30%': {  background:  'rgba(210,240,255,1)' },
          '60%, 100%': { filter: "blur(0px) invert(0)", "mask-image": 'linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 1))', "mask-size": "100% 100%", background:  'rgba(255,255,255,1)' },
        },
      },
      animation: {
        'brightness': 'brightness 0.9s 3 linear forwards',
      },
    },
  },
  plugins: [],
}