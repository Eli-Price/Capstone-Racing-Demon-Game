const path = require('path');

module.exports = {
  entry: './client/game_scripts/main.js',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};