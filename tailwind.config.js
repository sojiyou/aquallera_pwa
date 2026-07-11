/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '14px',
        sm: '16px',
        base: '18px',
        lg: '20px',
        xl: '22px',
        '2xl': '26px',
      },
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
