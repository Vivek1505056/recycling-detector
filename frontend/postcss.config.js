export default {
  plugins: {
    tailwindcss: {
      content: ['./index.html', './src/**/*.{ts,tsx}'],
      theme: {
        extend: {
          colors: {
            brand: {
              ink: '#17301c',
              moss: '#6e9f4d',
              cream: '#f6f3ea',
              clay: '#d7c1a2',
            },
          },
        },
      },
      plugins: [],
    },
    autoprefixer: {},
  },
};
