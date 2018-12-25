if (process.env.NODE_ENV === 'production') {
  exports.env = require('./dev.env.json');
} else {
  exports.env = require('./prod.env.json');
}
