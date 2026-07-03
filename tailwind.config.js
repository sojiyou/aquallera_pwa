/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          blue: '#191970',
          active: '#010113',
        },
        mist: {
          gray: '#ECEFF1',
        },
        light: {
          yellow: '#E5C95F',
        },
        app: {
          bg: '#FFFCF2',
        },
        blue: '#015084',
        order: {
          list: '#F4E8BB',
        },
        input: {
          bg: '#D9D9D9',
        },
        footer: {
          bg: '#2F3C51',
        },
      },
    },
  },
  plugins: [],
}
