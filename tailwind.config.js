// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    // if you’re using src/app
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // or just app/ when not in src
    './app/**/*.{js,ts,jsx,tsx,mdx}',

    // pages router (if you still have it)
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',

    // shared components
    './src/components/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: { fadeIn: 'fadeIn 1s ease-out' },
      keyframes: { fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } } },
      backgroundImage: {
        'hero-pattern': "url(data:image/png;base64,…)",
        'footer-texture': "url('/img/footer-texture.png')",
      },
      gridTemplateColumns: { sidebar: "300px auto" },
      gridTemplateRows:    { header: "64px auto" },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
}
