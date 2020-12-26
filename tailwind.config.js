module.exports = {
  important: true,
  purge: ["app/javascript/**/*", "app/views/**/*.html.erb"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      title: ["Cormorant SC", "serif"],
      display: [],
      body: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {},
      },
      typography: {
        DEFAULT: {
          css: {
            p: {
              "margin-top": "0.75em",
              "margin-bottom": "0.75em",
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
