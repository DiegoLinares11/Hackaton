/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        e4c: {
          green: '#1A7A5C',
          'green-light': '#ECFDF5',
          purple: '#534AB7',
          'purple-light': '#F0EDFE',
          coral: '#D85A30',
          'coral-light': '#FFF3ED',
          blue: '#2563EB',
          'blue-light': '#EFF6FF',
        }
      }
    },
  },
  plugins: [],
}
