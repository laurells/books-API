const markdownPlugin = require('./markdown');

// Other code...

module.exports = {
  schema: './graphql/bookSchema.js',
  generates: {
    '../README.md': {
      plugins: [
        markdownPlugin,
      ],
    },
  },
};