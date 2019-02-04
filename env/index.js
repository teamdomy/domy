if (process.env.NODE_ENV === 'production') {
  module.exports = module.require('./prod.env.json');
} else {
  module.exports = module.require('./dev.env.json');
}
